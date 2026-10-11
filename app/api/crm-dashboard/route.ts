import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";
import LeadModel from "../../../models/Lead";
import ServiceBookingModel from "../../../models/ServiceBooking";
import TechnicianModel from "../../../models/Technician";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const role = session?.user.role;
    if (role !== "admin" && role !== "manager" && role !== "technician") {
      return errorResponse("CRM authorization required.", 403);
    }

    await connectToDatabase();
    let bookingFilter: Record<string, unknown> = {};
    let leadFilter: Record<string, unknown> = {};

    if (role === "manager") {
      const technicianIds = await TechnicianModel.find({
        role: "Technician",
        manager: session.user.name,
      }).distinct("id");
      bookingFilter = { technicianId: { $in: technicianIds } };
      leadFilter = {
        $or: [
          { status: "New" },
          { managerName: session.user.name },
          { assignedTechnicianId: { $in: technicianIds } },
        ],
      };
    } else if (role === "technician") {
      bookingFilter = { technicianName: session.user.name };
      leadFilter = { assignedTechnicianName: session.user.name };
    }

    const [
      bookingCount,
      pendingCount,
      confirmedCount,
      cancelledCount,
      bookingValue,
      recentBookings,
      leadStatusCounts,
      newLeadCount,
    ] = await Promise.all([
      ServiceBookingModel.countDocuments(bookingFilter),
      ServiceBookingModel.countDocuments({ ...bookingFilter, status: "Pending" }),
      ServiceBookingModel.countDocuments({ ...bookingFilter, status: "Confirmed" }),
      ServiceBookingModel.countDocuments({ ...bookingFilter, status: "Cancelled" }),
      ServiceBookingModel.aggregate([
        { $match: { ...bookingFilter, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      ServiceBookingModel.find(bookingFilter)
        .select("id customerName serviceName requestedService technicianName date timeSlot status createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      LeadModel.aggregate([
        { $match: leadFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      LeadModel.countDocuments({ ...leadFilter, status: "New" }),
    ]);

    const leadCounts = Object.fromEntries(
      leadStatusCounts.map((entry: { _id: string; count: number }) => [entry._id, entry.count]),
    );

    return NextResponse.json({
      stats: {
        totalBookings: bookingCount,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        cancelledBookings: cancelledCount,
        totalBookingValue: bookingValue[0]?.total ?? 0,
        newLeads: newLeadCount,
      },
      recentBookings: recentBookings.map(({ _id, __v, ...booking }) => booking),
      leadCounts,
    });
  } catch (error) {
    console.error("Failed to load CRM dashboard data:", error);
    return errorResponse("Unable to load dashboard data.", 500);
  }
}
