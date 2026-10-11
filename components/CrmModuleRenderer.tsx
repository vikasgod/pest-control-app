"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
} from "lucide-react";
import type { CrmRole } from "../app/crm/roles";
import { roleLabels } from "../app/crm/roles";
import CustomerManagement from "../app/crm/CustomerManagement";
import BookingsManagement from "../app/crm/BookingsManagement";
import LeadWorkspace from "../app/crm/LeadWorkspace";
import ManagerScheduleBoard from "../app/crm/ManagerScheduleBoard";
import ReportsDashboard from "../app/crm/ReportsDashboard";
import StaffManagement from "../app/crm/StaffManagement";
import TechnicianWorkBoard from "../app/crm/TechnicianWorkBoard";
import ServiceManagement from "./ServiceManagement";

type DashboardBooking = {
  id: string;
  customerName: string;
  serviceName: string;
  requestedService: string;
  technicianName: string;
  date: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Cancelled";
};

type DashboardData = {
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalBookingValue: number;
    newLeads: number;
  };
  recentBookings: DashboardBooking[];
  leadCounts: Record<string, number>;
};

type CrmModuleRendererProps = {
  active: string;
  role: CrmRole;
  managerName?: string;
};

export function CrmModuleRenderer({ active, role, managerName }: CrmModuleRendererProps) {
  if (active === "Leads") {
    return <LeadWorkspace role={role} />;
  }

  if (active === "Assigned Leads") {
    return <LeadWorkspace role={role} />;
  }

  if (active === "Customers") {
    return <CustomerManagement />;
  }

  if (active === "Staff") {
    return <StaffManagement role={role} managerName={managerName} />;
  }

  if (active === "Services") {
    return <ServiceManagement role={role} />;
  }

  if (active === "Bookings") {
    return <BookingsManagement role={role} />;
  }

  if (active === "Reports" || active === "Service Report") {
    return <ReportsDashboard />;
  }

  if (active === "Schedule") {
    return <ManagerScheduleBoard />;
  }

  if (active === "Profile") {
    return <TechnicianWorkBoard />;
  }

  return (
    <>
      {active === "Dashboard" || active === "Overview" ? (
        <CrmDashboard role={role} />
      ) : (
        <SimpleScreen title={active} role={role} />
      )}
    </>
  );
}

function CrmDashboard({ role }: { role: CrmRole }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/crm-dashboard");
      const result: DashboardData & { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to load dashboard data.");
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = data?.stats;
  const cards = [
    { label: "Total Bookings", value: stats?.totalBookings, icon: CalendarDays },
    { label: "Pending Bookings", value: stats?.pendingBookings, icon: Clock3 },
    { label: "Confirmed Bookings", value: stats?.confirmedBookings, icon: CheckCircle2 },
    { label: "Total Booking Value", value: stats ? `₹${stats.totalBookingValue.toLocaleString("en-IN")}` : undefined, icon: IndianRupee },
  ];
  const leadStages = [
    { label: "New Leads", status: "New", color: "bg-sky-500" },
    { label: "Assigned", status: "Assigned", color: "bg-amber-400" },
    { label: "Quotation Sent", status: "Quoted", color: "bg-violet-500" },
    { label: "Accepted", status: "Accepted", color: "bg-emerald-500" },
    { label: "Declined", status: "Declined", color: "bg-rose-400" },
  ];
  const maxLeadCount = Math.max(1, ...leadStages.map(({ status }) => data?.leadCounts[status] ?? 0));

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {role === "manager" ? "Your team data" : role === "technician" ? "Your assigned work" : "All business data"}
        </p>
        <button onClick={() => void loadDashboard()} disabled={loading} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon size={18} className="text-emerald-700" />
            </div>
            <div className="mt-4 text-3xl font-black">{loading ? "—" : value ?? 0}</div>
            <span className="mt-2 block text-xs text-slate-500">From saved records</span>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        <section className="rounded-2xl border bg-white p-6">
          <div>
            <h2 className="text-lg font-black">Recent bookings</h2>
            <p className="text-sm text-slate-500">Latest bookings saved in the database</p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="pb-3">Booking</th><th className="pb-3">Customer</th><th className="pb-3">Service</th><th className="pb-3">Technician</th><th className="pb-3">Status</th></tr>
              </thead>
              <tbody>
                {data?.recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-4 font-bold">{booking.id}<span className="block text-xs font-normal text-slate-400">{booking.date} · {booking.timeSlot}</span></td>
                    <td className="py-4">{booking.customerName}</td>
                    <td className="py-4">{booking.serviceName}<span className="block text-xs text-slate-400">{booking.requestedService}</span></td>
                    <td className="py-4">{booking.technicianName}</td>
                    <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : booking.status === "Cancelled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && data?.recentBookings.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No bookings found.</p>}
            {loading && <p className="py-8 text-center text-sm text-slate-500">Loading bookings...</p>}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-black">Lead pipeline</h2>
          <p className="text-sm text-slate-500">Lead statuses from saved records</p>
          <div className="mt-7 space-y-5">
            {leadStages.map(({ label, status, color }) => {
              const count = data?.leadCounts[status] ?? 0;
              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm"><span>{label}</span><b>{loading ? "—" : count}</b></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${color}`} style={{ width: `${loading ? 0 : (count / maxLeadCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {stats && stats.newLeads > 0 && (
            <div className="mt-8 rounded-xl bg-amber-50 p-4">
              <div className="flex gap-3"><AlertCircle className="text-amber-600" size={19} /><div><b className="text-sm">New leads need review</b><p className="mt-1 text-xs text-slate-600">{stats.newLeads} new lead(s) awaiting assignment.</p></div></div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}

function SimpleScreen({ title, role }: { title: string; role: CrmRole }) {
  const cards = [
    { label: "Assigned", value: title === "Service Report" ? "12 reports" : title === "Profile" ? "Active profile" : "18 items", tone: "bg-emerald-50 text-emerald-700" },
    { label: "Pending", value: title === "Follow-ups" ? "8 follow-ups" : title === "Reports" ? "3 reports" : "7 pending", tone: "bg-amber-50 text-amber-700" },
    { label: "Updated", value: "Today", tone: "bg-sky-50 text-sky-700" },
  ];

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{roleLabels[role]} workspace</p>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
        </div>
        <button className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Create {title}</button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${card.tone}`}>{card.label}</div>
            <p className="mt-4 text-2xl font-black text-[#102a33]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-lg font-bold text-slate-700">{title} screen is ready for implementation</p>
        <p className="mt-2 text-sm text-slate-500">This section will manage the full workflow for the selected role-specific module.</p>
      </div>
    </section>
  );
}
