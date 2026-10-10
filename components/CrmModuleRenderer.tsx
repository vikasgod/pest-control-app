"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MoreHorizontal,
  Plus,
  TrendingUp,
} from "lucide-react";
import type { CrmRole } from "../app/crm/roles";
import { roleLabels } from "../app/crm/roles";
import CustomerManagement from "../app/crm/CustomerManagement";
import JobsManagement from "../app/crm/JobsManagement";
import LeadManagement from "../app/crm/LeadManagement";
import ManagerScheduleBoard from "../app/crm/ManagerScheduleBoard";
import ReportsDashboard from "../app/crm/ReportsDashboard";
import StaffManagement from "../app/crm/StaffManagement";
import TechnicianWorkBoard from "../app/crm/TechnicianWorkBoard";
import ServiceManagement from "./ServiceManagement";

const bookings = [
  ["PC-10245", "Rahul Sharma", "Cockroach Control", "Today, 10:00 AM", "Rajesh", "Confirmed"],
  ["PC-10244", "Priya Mehta", "Termite Control", "Today, 1:30 PM", "Amit", "Assigned"],
  ["PC-10243", "Amit Verma", "Bed Bug Control", "Tomorrow, 11:00 AM", "Sunil", "Pending"],
  ["PC-10242", "Neha Shah", "Mosquito Control", "Tomorrow, 4:00 PM", "Rajesh", "Completed"],
] as const;

type CrmModuleRendererProps = {
  active: string;
  role: CrmRole;
  managerName?: string;
};

export function CrmModuleRenderer({ active, role, managerName }: CrmModuleRendererProps) {
  if (active === "Leads") {
    return <LeadManagement />;
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

  if (active === "Jobs" || active === "Job Assignments" || active === "Assigned Jobs" || active === "Job Details") {
    return <JobsManagement role={role} />;
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["42", "Total Bookings", TrendingUp],
              ["18", "Pending Jobs", Clock3],
              ["24", "Completed", CheckCircle2],
              ["₹38,450", "Today Revenue", IndianRupee],
            ].map(([value, label, Icon]) => {
              const StatIcon = Icon as typeof TrendingUp;
              return (
                <div key={label as string} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{label as string}</span>
                    <StatIcon size={18} className="text-emerald-700" />
                  </div>
                  <div className="mt-4 text-3xl font-black">{value as string}</div>
                  <span className="mt-2 block text-xs font-bold text-emerald-700">+12% from last week</span>
                </div>
              );
            })}
          </div>

          <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
            <section className="rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Recent bookings</h2>
                  <p className="text-sm text-slate-500">Latest service requests</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">
                  <Plus size={16} /> New Booking
                </button>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wider text-slate-400">
                    <tr><th className="pb-3">Booking</th><th className="pb-3">Customer</th><th className="pb-3">Service</th><th className="pb-3">Technician</th><th className="pb-3">Status</th><th /></tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking[0]} className="border-b last:border-0">
                        <td className="py-4 font-bold">{booking[0]}<span className="block text-xs font-normal text-slate-400">{booking[3]}</span></td>
                        <td className="py-4">{booking[1]}</td><td className="py-4">{booking[2]}</td><td className="py-4">{booking[4]}</td>
                        <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${booking[5] === "Completed" ? "bg-emerald-100 text-emerald-700" : booking[5] === "Pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{booking[5]}</span></td>
                        <td><MoreHorizontal size={18} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-black">Lead pipeline</h2>
              <p className="text-sm text-slate-500">This month&apos;s sales funnel</p>
              <div className="mt-7 space-y-5">
                {[
                  ["New Leads", 124, "bg-slate-200"], ["Contacted", 86, "bg-blue-200"],
                  ["Interested", 54, "bg-amber-200"], ["Quotation", 31, "bg-purple-200"], ["Converted", 24, "bg-emerald-500"],
                ].map(([name, count, color]) => (
                  <div key={name as string}>
                    <div className="mb-2 flex justify-between text-sm"><span>{name}</span><b>{count}</b></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${color}`} style={{ width: `${Math.min(((count as number) / 124) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl bg-amber-50 p-4">
                <div className="flex gap-3"><AlertCircle className="text-amber-600" size={19} /><div><b className="text-sm">Follow-up reminder</b><p className="mt-1 text-xs text-slate-600">8 leads have not been contacted in 24 hours.</p></div></div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <SimpleScreen title={active} role={role} />
      )}
    </>
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
