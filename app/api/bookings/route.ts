import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";
import { serviceOptions, timeSlotOptions } from "../../../lib/technicians";
import ServiceBookingModel from "../../../models/ServiceBooking";
import ServiceCategoryModel, { type StoredServiceCategory } from "../../../models/ServiceCategory";
import TechnicianModel from "../../../models/Technician";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getManagementSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role;
  if (role !== "admin" && role !== "manager") return null;
  return { session, role };
}

export async function GET() {
  try {
    const access = await getManagementSession();
    if (!access) return errorResponse("Admin or manager authorization required.", 403);

    await connectToDatabase();
    const technicianFilter: Record<string, unknown> = {
      role: "Technician",
      isDeleted: { $ne: true },
    };
    if (access.role === "manager") technicianFilter.manager = access.session.user.name;

    const teamTechnicianQuery: Record<string, unknown> = {
      role: "Technician",
      ...(access.role === "manager" ? { manager: access.session.user.name } : {}),
    };
    const [technicians, teamTechnicianIds] = await Promise.all([
      TechnicianModel.find(technicianFilter)
      .select("id name pincode services")
      .sort({ name: 1 })
      .lean(),
      access.role === "manager"
        ? TechnicianModel.find(teamTechnicianQuery).distinct("id")
        : Promise.resolve([]),
    ]);
    const bookings = await ServiceBookingModel.find(access.role === "admin"
      ? {}
      : { technicianId: { $in: teamTechnicianIds } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      bookings: bookings.map(({ _id, __v, ...booking }) => booking),
      technicians,
    });
  } catch (error) {
    console.error("Failed to load bookings for CRM:", error);
    return errorResponse("Unable to load bookings.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const access = await getManagementSession();
    if (!access) return errorResponse("Admin or manager authorization required.", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Booking update details are required.", 400);
    }

    const payload = body as Record<string, unknown>;
    const { id, customerName, phone, email, address, pincode, date, timeSlot, technicianId, status } = payload;
    if (
      typeof id !== "string" ||
      typeof customerName !== "string" ||
      typeof phone !== "string" ||
      typeof email !== "string" ||
      typeof address !== "string" ||
      typeof pincode !== "string" ||
      typeof date !== "string" ||
      typeof timeSlot !== "string" ||
      typeof technicianId !== "string" ||
      (status !== "Pending" && status !== "Confirmed" && status !== "Cancelled")
    ) {
      return errorResponse("Complete all editable booking details.", 400);
    }

    const trimmedName = customerName.trim();
    const trimmedPhone = phone.replace(/\D/g, "");
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedAddress = address.trim();
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (!trimmedName || trimmedName.length > 100 || !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      return errorResponse("Enter a valid customer name and 10-digit mobile number.", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 254) {
      return errorResponse("Enter a valid email address.", 400);
    }
    if (!trimmedAddress || trimmedAddress.length > 500) {
      return errorResponse("Enter a service address between 1 and 500 characters.", 400);
    }
    if (!/^\d{6}$/.test(pincode)) {
      return errorResponse("Enter a valid 6-digit booking pincode.", 400);
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date ||
      !timeSlotOptions.some((option) => option === timeSlot)
    ) {
      return errorResponse("Select a valid service date and time slot.", 400);
    }

    await connectToDatabase();
    const managerTechnicianFilter: Record<string, unknown> = {
      id: technicianId,
      role: "Technician",
      isDeleted: { $ne: true },
    };
    if (access.role === "manager") managerTechnicianFilter.manager = access.session.user.name;
    const technician = await TechnicianModel.findOne(managerTechnicianFilter).lean();
    if (!technician) return errorResponse("That technician is not available for your team.", 404);

    const currentBooking = await ServiceBookingModel.findOne({ id }).lean();
    if (!currentBooking) return errorResponse("Booking not found.", 404);

    const allowedTechnicianIds = access.role === "admin"
      ? undefined
      : await TechnicianModel.find({
          role: "Technician",
          manager: access.session.user.name,
        }).distinct("id");
    if (allowedTechnicianIds && !allowedTechnicianIds.includes(currentBooking.technicianId)) {
      return errorResponse("You do not have access to this booking.", 403);
    }
    if (technician.pincode !== pincode || !technician.services.includes(currentBooking.requestedService)) {
      return errorResponse("Select a technician who supports this service at the booking pincode.", 400);
    }

    if (status !== "Cancelled") {
      const existingBooking = await ServiceBookingModel.findOne({
        id: { $ne: id },
        technicianId,
        date,
        timeSlot,
        status: { $in: ["Pending", "Confirmed"] },
      }).lean();
      if (existingBooking) {
        return errorResponse("This technician's selected time slot is already booked.", 409);
      }
    }

    const booking = await ServiceBookingModel.findOneAndUpdate(
      { id },
      {
        $set: {
          customerName: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          address: trimmedAddress,
          pincode,
          date,
          timeSlot,
          technicianId: technician.id,
          technicianName: technician.name,
          status,
        },
      },
      { new: true, runValidators: true },
    ).lean();
    if (!booking) return errorResponse("Booking not found.", 404);
    const { _id, __v, ...safeBooking } = booking;
    return NextResponse.json({ booking: safeBooking });
  } catch (error) {
    console.error("Failed to update booking:", error);
    return errorResponse("Unable to update booking.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const access = await getManagementSession();
    if (!access) return errorResponse("Admin or manager authorization required.", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null || typeof (body as Record<string, unknown>).id !== "string") {
      return errorResponse("A booking ID is required.", 400);
    }
    const id = (body as { id: string }).id;

    await connectToDatabase();
    const booking = await ServiceBookingModel.findOne({ id }).lean();
    if (!booking) return errorResponse("Booking not found.", 404);
    if (access.role === "manager") {
      const technician = await TechnicianModel.findOne({
        id: booking.technicianId,
        role: "Technician",
        manager: access.session.user.name,
      }).lean();
      if (!technician) return errorResponse("You do not have access to this booking.", 403);
    }

    await ServiceBookingModel.deleteOne({ id });
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return errorResponse("Unable to delete booking.", 500);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON request body.", 400);
  }
  if (typeof body !== "object" || body === null) {
    return errorResponse("Booking details are required.", 400);
  }

  const payload = body as Record<string, unknown>;
  const {
    customerName,
    phone,
    email,
    address,
    categoryId,
    serviceId,
    technicianId,
    requestedService,
    pincode,
    date,
    timeSlot,
  } = payload;

  if (
    typeof customerName !== "string" ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    typeof address !== "string" ||
    typeof categoryId !== "string" ||
    typeof serviceId !== "string" ||
    typeof technicianId !== "string" ||
    typeof requestedService !== "string" ||
    typeof pincode !== "string" ||
    typeof date !== "string" ||
    typeof timeSlot !== "string"
  ) {
    return errorResponse("Complete all required booking details.", 400);
  }

  const trimmedName = customerName.trim();
  const trimmedPhone = phone.replace(/\D/g, "");
  const trimmedEmail = email.trim();
  const trimmedAddress = address.trim();
  if (!trimmedName || trimmedName.length > 100 || !/^[6-9]\d{9}$/.test(trimmedPhone)) {
    return errorResponse("Enter a valid customer name and 10-digit mobile number.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 254) {
    return errorResponse("Enter a valid email address.", 400);
  }
  if (!trimmedAddress || trimmedAddress.length > 500) {
    return errorResponse("Enter a service address between 1 and 500 characters.", 400);
  }
  if (
    !/^\d{6}$/.test(pincode) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !serviceOptions.some((service) => service === requestedService) ||
    !timeSlotOptions.some((slot) => slot === timeSlot)
  ) {
    return errorResponse("The selected service location, date, or time slot is invalid.", 400);
  }
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return errorResponse("Enter a valid service date.", 400);
  }

  try {
    await connectToDatabase();
    const [category, technician] = await Promise.all([
      ServiceCategoryModel.findOne({ id: categoryId }),
      TechnicianModel.findOne({
        id: technicianId,
        role: "Technician",
        status: "Available",
        pincode,
        services: requestedService,
        isDeleted: { $ne: true },
      }),
    ]);
    if (!category) return errorResponse("Service category not found.", 404);

    const service = category.services.find(
      (item: StoredServiceCategory["services"][number]) => item.id === serviceId && item.isActive,
    );
    if (!service) return errorResponse("This service is no longer available.", 404);
    if (!technician) return errorResponse("This technician is no longer available for the selected search.", 409);

    const existingBooking = await ServiceBookingModel.findOne({
      technicianId,
      date,
      timeSlot,
      status: { $in: ["Pending", "Confirmed"] },
    }).lean();
    if (existingBooking) {
      return errorResponse("This technician's selected time slot has just been booked. Please search again.", 409);
    }

    const booking = await ServiceBookingModel.create({
      id: `bk_${randomUUID()}`,
      customerName: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      address: trimmedAddress,
      categoryId: category.id,
      categoryName: category.name,
      serviceId: service.id,
      serviceName: service.name,
      serviceType: service.serviceType ?? "One time",
      price: service.discountPrice ?? service.price,
      technicianId: technician.id,
      technicianName: technician.name,
      requestedService,
      pincode,
      date,
      timeSlot,
      status: "Pending",
    });

    return NextResponse.json(
      { booking: { id: booking.id, status: booking.status } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create service booking:", error);
    return errorResponse("Unable to create service booking.", 500);
  }
}
