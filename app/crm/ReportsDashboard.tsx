"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type ReportData = {
  stats: {
    totalBookings: number;
    activeBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    bookingValue: number;
    averageBookingValue: number;
    totalLeads: number;
    newLeads: number;
    quoteSent: number;
    acceptedQuotes: number;
    declinedQuotes: number;
    quoteResponseRate: number;
    quoteAcceptanceRate: number;
  };
  bookingCounts: Record<string, number>;
  leadCounts: Record<string, number>;
  serviceBreakdown: Array<{ service: string; bookings: number; bookingValue: number }>;
  monthlyBookings: Array<{ month: string; bookings: number }>;
};

const leadStages = [
  { status: "New", color: "bg-sky-500" },
  { status: "Assigned", color: "bg-amber-400" },
  { status: "Quoted", color: "bg-violet-500" },
  { status: "Accepted", color: "bg-emerald-500" },
  { status: "Declined", color: "bg-rose-400" },
] as const;

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function ReportsDashboard() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/crm-reports");
      const result: ReportData & { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to load report data.");
      setReport(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const stats = report?.stats;
  const statCards = [
    { label: "Booking value", value: stats ? formatCurrency(stats.bookingValue) : "—", detail: "Non-cancelled bookings" },
    { label: "Quote response rate", value: stats ? `${stats.quoteResponseRate}%` : "—", detail: "Customer responses to sent quotes" },
    { label: "Average booking value", value: stats ? formatCurrency(stats.averageBookingValue) : "—", detail: "Non-cancelled bookings" },
    { label: "Quote acceptance rate", value: stats ? `${stats.quoteAcceptanceRate}%` : "—", detail: "Accepted out of accepted / declined quotes" },
  ];
  const maxLeadCount = Math.max(1, ...leadStages.map(({ status }) => report?.leadCounts[status] ?? 0));
  const maxMonthlyCount = Math.max(1, ...(report?.monthlyBookings.map(({ bookings }) => bookings) ?? []));
  const maxServiceCount = Math.max(1, ...(report?.serviceBreakdown.map(({ bookings }) => bookings) ?? []));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Performance</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Live summaries calculated from saved bookings and leads.</p>
        </div>
        <button onClick={() => void loadReport()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">
          <RefreshCw size={16} />{loading ? "Loading..." : "Refresh reports"}
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, detail }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#102a33]">{loading ? "—" : value}</p>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black">Lead pipeline</h3>
            <p className="mt-1 text-sm text-slate-500">{stats?.totalLeads ?? 0} leads in this report scope</p>
            <div className="mt-6 space-y-5">
              {leadStages.map(({ status, color }) => {
                const count = report?.leadCounts[status] ?? 0;
                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{status === "Quoted" ? "Quotation sent" : status}</span>
                      <b>{loading ? "—" : count}</b>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`${color} h-full`} style={{ width: `${loading ? 0 : (count / maxLeadCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black">Monthly bookings</h3>
            <p className="mt-1 text-sm text-slate-500">Bookings created in the last six calendar months</p>
            <div className="mt-6 space-y-4">
              {report?.monthlyBookings.map(({ month, bookings }) => (
                <div key={month}>
                  <div className="mb-2 flex items-center justify-between text-sm"><span>{month}</span><b>{bookings}</b></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-emerald-500" style={{ width: `${(bookings / maxMonthlyCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {loading && <p className="text-sm text-slate-500">Loading monthly booking data...</p>}
              {!loading && report?.monthlyBookings.length === 0 && <p className="text-sm text-slate-500">No booking data available.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black">Bookings by service</h3>
            <p className="mt-1 text-sm text-slate-500">Non-cancelled bookings</p>
            <div className="mt-5 space-y-4">
              {report?.serviceBreakdown.map(({ service, bookings, bookingValue }) => (
                <div key={service} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-800">{service}</p>
                    <span className="text-sm font-black">{bookings}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full bg-emerald-500" style={{ width: `${(bookings / maxServiceCount) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Booking value: {formatCurrency(bookingValue)}</p>
                </div>
              ))}
              {loading && <p className="text-sm text-slate-500">Loading service breakdown...</p>}
              {!loading && report?.serviceBreakdown.length === 0 && <p className="text-sm text-slate-500">No booking data available.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black">Booking status</h3>
            <div className="mt-5 space-y-3">
              {[
                ["Pending", report?.stats.pendingBookings ?? 0, "text-amber-700"],
                ["Confirmed", report?.stats.confirmedBookings ?? 0, "text-emerald-700"],
                ["Cancelled", report?.stats.cancelledBookings ?? 0, "text-rose-700"],
              ].map(([label, count, color]) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className={`font-black ${color}`}>{loading ? "—" : count}</span>
                </div>
              ))}
              <p className="pt-2 text-xs text-slate-500">Total bookings recorded: {loading ? "—" : stats?.totalBookings ?? 0}</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
