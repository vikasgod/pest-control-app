"use client";

import type { FormEvent } from "react";
import type { CrmRole } from "../app/crm/roles";

export type JobStatus = "Pending" | "Scheduled" | "In progress" | "Completed";
export type JobPriority = "High" | "Medium" | "Low";

export type Job = {
  id: string;
  customer: string;
  service: string;
  technician: string;
  status: JobStatus;
  priority: JobPriority;
  scheduled: string;
};

export type JobAssignmentForm = {
  customer: string;
  service: string;
  technician: string;
  status: JobStatus;
  priority: JobPriority;
  scheduled: string;
};

export const technicians = ["Nikhil Verma", "Ananya Joshi", "Mehul Shah", "Rohit Sethi"];

type JobAssignmentBoardProps = {
  role?: CrmRole;
  jobs: Job[];
  form: JobAssignmentForm;
  canEditJobAssignments: boolean;
  onFormChange: (field: keyof JobAssignmentForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateJob: (jobId: string, field: "status" | "technician", value: string) => void;
};

export default function JobAssignmentBoard({
  role = "admin",
  jobs,
  form,
  canEditJobAssignments,
  onFormChange,
  onSubmit,
  onUpdateJob,
}: JobAssignmentBoardProps) {
  const metrics = [
    { label: "Open jobs", value: String(jobs.filter((job) => job.status !== "Completed").length), detail: "Active work orders" },
    { label: "In progress", value: String(jobs.filter((job) => job.status === "In progress").length), detail: "Live service calls" },
    { label: "Completed", value: String(jobs.filter((job) => job.status === "Completed").length), detail: "This week" },
    { label: "Urgent", value: String(jobs.filter((job) => job.priority === "High").length), detail: "Priority attention" },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Operations</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Jobs</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {role === "manager" ? "Manager access" : role === "admin" ? "Admin access" : "View only"}
        </span>
      </div>

      {canEditJobAssignments ? (
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-black">Assign job</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Customer
              <input
                value={form.customer}
                onChange={(e) => onFormChange("customer", e.target.value)}
                placeholder="Customer name"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Service
              <select value={form.service} onChange={(e) => onFormChange("service", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                <option value="Cockroach Control">Cockroach Control</option>
                <option value="Mosquito Control">Mosquito Control</option>
                <option value="Termite Inspection">Termite Inspection</option>
                <option value="Bed Bug Treatment">Bed Bug Treatment</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Technician
              <select value={form.technician} onChange={(e) => onFormChange("technician", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                {technicians.map((technician) => (
                  <option key={technician} value={technician}>{technician}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Status
              <select value={form.status} onChange={(e) => onFormChange("status", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Priority
              <select value={form.priority} onChange={(e) => onFormChange("priority", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2 xl:col-span-1">
              Scheduled
              <input value={form.scheduled} onChange={(e) => onFormChange("scheduled", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </label>
            <div className="flex items-end md:col-span-2 xl:col-span-1">
              <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">Assign job</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Job assignments are view-only for this role. Only admins and managers can edit assignment details.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#102a33]">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-black">Job queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Job ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Technician</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-bold text-[#102a33]">{job.id}</td>
                  <td className="px-5 py-4">{job.customer}</td>
                  <td className="px-5 py-4">{job.service}</td>
                  <td className="px-5 py-4">
                    {canEditJobAssignments ? (
                      <select value={job.technician} onChange={(e) => onUpdateJob(job.id, "technician", e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-600">
                        {technicians.map((technician) => (
                          <option key={technician} value={technician}>{technician}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-600">{job.technician}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {canEditJobAssignments ? (
                      <select value={job.status} onChange={(e) => onUpdateJob(job.id, "status", e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-600">
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${job.status === "Completed" ? "bg-emerald-100 text-emerald-700" : job.status === "In progress" ? "bg-blue-100 text-blue-700" : job.status === "Scheduled" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"}`}>
                        {job.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${job.priority === "High" ? "bg-red-100 text-red-700" : job.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{job.scheduled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
