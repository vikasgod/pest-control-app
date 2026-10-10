import { NextResponse } from "next/server";
import { ensureTechnicianRoster } from "../../../lib/ensure-technician-roster";
import { connectToDatabase } from "../../../lib/mongodb";
import { serviceOptions, timeSlotOptions } from "../../../lib/technicians";
import ServiceBookingModel from "../../../models/ServiceBooking";
import TechnicianModel from "../../../models/Technician";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service")?.trim();
  const pincode = searchParams.get("pincode")?.trim();
  const date = searchParams.get("date");
  const timeSlot = searchParams.get("timeSlot");
  const selectedService = serviceOptions.find((option) => option === service);
  const selectedTimeSlot = timeSlotOptions.find((option) => option === timeSlot);

  if (
    !selectedService ||
    !pincode ||
    !/^\d{6}$/.test(pincode) ||
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !selectedTimeSlot
  ) {
    return NextResponse.json(
      { error: "Select a service, enter a valid 6-digit pincode, and choose a date and time slot." },
      { status: 400 },
    );
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return NextResponse.json({ error: "Enter a valid service date." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await ensureTechnicianRoster();
    const storedTechnicians = await TechnicianModel.find({
      role: "Technician",
      isDeleted: { $ne: true },
    }).lean();
    const bookedSlots = await ServiceBookingModel.find({
      date,
      timeSlot: selectedTimeSlot,
      status: { $in: ["Pending", "Confirmed"] },
    }).distinct("technicianId");
    const bookedTechnicianIds = new Set(bookedSlots);

    const technicians = storedTechnicians
      .filter(
        (member) =>
          member.status === "Available" &&
          !bookedTechnicianIds.has(member.id) &&
          member.pincode === pincode &&
          member.services?.includes(selectedService),
      )
      .map(({ id, name, team, location, pincode: technicianPincode }) => ({
        id,
        name,
        team,
        location,
        pincode: technicianPincode,
      }));

    return NextResponse.json({ service: selectedService, pincode, date, timeSlot: selectedTimeSlot, technicians });
  } catch (error) {
    console.error("Failed to check technician availability:", error);
    return NextResponse.json({ error: "Unable to check technician availability." }, { status: 500 });
  }
}
