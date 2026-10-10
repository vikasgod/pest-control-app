import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { serviceOptions, timeSlotOptions } from "../../../lib/technicians";
import ServiceBookingModel from "../../../models/ServiceBooking";
import ServiceCategoryModel, { type StoredServiceCategory } from "../../../models/ServiceCategory";
import TechnicianModel from "../../../models/Technician";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
