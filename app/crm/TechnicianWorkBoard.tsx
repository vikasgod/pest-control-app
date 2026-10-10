"use client";

import { type FormEvent, useState } from "react";

type JobAssignment = {
  id: string;
  customer: string;
  service: string;
  address: string;
  status: string;
};

const initialJobs: JobAssignment[] = [
  { id: "JOB-2048", customer: "Riya Kapoor", service: "Cockroach Control", address: "Bandra West", status: "In progress" },
  { id: "JOB-2051", customer: "Sonia Nair", service: "Bed Bug Treatment", address: "Andheri East", status: "Scheduled" },
  { id: "JOB-2054", customer: "Amit Shah", service: "Mosquito Control", address: "Malad West", status: "Pending review" },
];

export default function TechnicianWorkBoard() {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedId, setSelectedId] = useState(initialJobs[0].id);
  const [report, setReport] = useState({
    pestsFound: "Cockroaches under sink",
    treatment: "Gel bait + spray",
    notes: "Customer requested 3-month prevention plan.",
    nextFollowUp: "2026-06-24",
  });

  const selectedJob = jobs.find((job) => job.id === selectedId) ?? jobs[0];

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJobs((current) => current.map((job) => {
      if (job.id !== selectedJob.id) return job;
      return { ...job, status: "Completed" };
    }));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Field work</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Assigned Jobs</h2>
        </div>
        <button className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">Start job</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Today", value: "5 jobs" },
          { label: "Pending review", value: "2 jobs" },
          { label: "Completed", value: "9 jobs" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#102a33]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-lg font-black">Job queue</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <button key={job.id} type="button" onClick={() => setSelectedId(job.id)} className={`flex w-full flex-col gap-3 px-5 py-4 text-left md:flex-row md:items-center md:justify-between ${selectedId === job.id ? "bg-emerald-50" : "bg-white"}`}>
                <div>
                  <p className="font-bold text-[#102a33]">{job.customer}</p>
                  <p className="mt-1 text-sm text-slate-500">{job.id} • {job.service}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${job.status === "In progress" ? "bg-blue-100 text-blue-700" : job.status === "Scheduled" ? "bg-violet-100 text-violet-700" : job.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {job.status}
                  </span>
                  <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Open</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleReportSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-semibold text-emerald-700">Service report</p>
            <h3 className="mt-1 text-xl font-black text-[#102a33]">{selectedJob.customer}</h3>
            <p className="mt-1 text-sm text-slate-500">{selectedJob.service} • {selectedJob.address}</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Pests found
              <textarea value={report.pestsFound} onChange={(e) => setReport((current) => ({ ...current, pestsFound: e.target.value }))} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Treatment performed
              <textarea value={report.treatment} onChange={(e) => setReport((current) => ({ ...current, treatment: e.target.value }))} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Technician notes
              <textarea value={report.notes} onChange={(e) => setReport((current) => ({ ...current, notes: e.target.value }))} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Next follow-up date
              <input type="date" value={report.nextFollowUp} onChange={(e) => setReport((current) => ({ ...current, nextFollowUp: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </label>
          </div>

          <button type="submit" className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">Submit service report</button>
        </form>
      </div>
    </section>
  );
}
