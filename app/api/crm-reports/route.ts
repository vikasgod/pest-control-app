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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setUTCDate(1);
    sixMonthsAgo.setUTCHours(0, 0, 0, 0);
    sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5);

    const [
      bookingStats,
      bookingStatusCounts,
      serviceBreakdown,
      monthlyBookings,
      leadStatusCounts,
    ] = await Promise.all([
      ServiceBookingModel.aggregate([
        { $match: bookingFilter },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            activeBookings: { $sum: { $cond: [{ $ne: ["$status", "Cancelled"] }, 1, 0] } },
            bookingValue: { $sum: { $cond: [{ $ne: ["$status", "Cancelled"] }, "$price", 0] } },
          },
        },
      ]),
      ServiceBookingModel.aggregate([
        { $match: bookingFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ServiceBookingModel.aggregate([
        { $match: { ...bookingFilter, status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: "$requestedService",
            bookings: { $sum: 1 },
            bookingValue: { $sum: "$price" },
          },
        },
        { $sort: { bookings: -1, _id: 1 } },
        { $limit: 5 },
      ]),
      ServiceBookingModel.aggregate([
        { $match: { ...bookingFilter, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      LeadModel.aggregate([
        { $match: leadFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const bookingCounts = Object.fromEntries(
      bookingStatusCounts.map((item: { _id: string; count: number }) => [item._id, item.count]),
    );
    const leadCounts = Object.fromEntries(
      leadStatusCounts.map((item: { _id: string; count: number }) => [item._id, item.count]),
    );
    const monthlyCounts = Object.fromEntries(
      monthlyBookings.map((item: { _id: string; bookings: number }) => [item._id, item.bookings]),
    );
    const months = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(sixMonthsAgo);
      month.setUTCMonth(month.getUTCMonth() + index);
      const key = month.toISOString().slice(0, 7);
      return {
        month: month.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" }),
        bookings: monthlyCounts[key] ?? 0,
      };
    });

    const totalLeads = Object.values(leadCounts).reduce((total, count) => total + count, 0);
    const quoteSent = leadCounts.Quoted ?? 0;
    const acceptedQuotes = leadCounts.Accepted ?? 0;
    const declinedQuotes = leadCounts.Declined ?? 0;
    const respondedQuotes = acceptedQuotes + declinedQuotes;
    const stats = bookingStats[0] ?? { totalBookings: 0, activeBookings: 0, bookingValue: 0 };

    return NextResponse.json({
      stats: {
        totalBookings: stats.totalBookings,
        activeBookings: stats.activeBookings,
        pendingBookings: bookingCounts.Pending ?? 0,
        confirmedBookings: bookingCounts.Confirmed ?? 0,
        cancelledBookings: bookingCounts.Cancelled ?? 0,
        bookingValue: stats.bookingValue,
        averageBookingValue: stats.activeBookings ? Math.round(stats.bookingValue / stats.activeBookings) : 0,
        totalLeads,
        newLeads: leadCounts.New ?? 0,
        quoteSent,
        acceptedQuotes,
        declinedQuotes,
        quoteResponseRate: respondedQuotes + quoteSent
          ? Math.round((respondedQuotes / (respondedQuotes + quoteSent)) * 100)
          : 0,
        quoteAcceptanceRate: respondedQuotes
          ? Math.round((acceptedQuotes / respondedQuotes) * 100)
          : 0,
      },
      bookingCounts,
      leadCounts,
      serviceBreakdown: serviceBreakdown.map((item: { _id: string; bookings: number; bookingValue: number }) => ({
        service: item._id,
        bookings: item.bookings,
        bookingValue: item.bookingValue,
      })),
      monthlyBookings: months,
    });
  } catch (error) {
    console.error("Failed to load CRM report data:", error);
    return errorResponse("Unable to load report data.", 500);
  }
}
