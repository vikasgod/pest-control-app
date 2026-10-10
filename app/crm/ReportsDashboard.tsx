const statCards = [
  { label: "Total revenue", value: "₹4.8L", detail: "This month" },
  { label: "Close rate", value: "31%", detail: "Lead conversion" },
  { label: "Avg. job value", value: "₹3,450", detail: "Per service call" },
  { label: "Follow-up score", value: "92%", detail: "Customer response" },
];

const pipeline = [
  { label: "New leads", count: 124, color: "bg-slate-300" },
  { label: "Qualified", count: 86, color: "bg-blue-300" },
  { label: "Quoted", count: 54, color: "bg-amber-300" },
  { label: "Converted", count: 31, color: "bg-emerald-500" },
];

const recentReports = [
  { title: "Termite control conversion", value: "+18%", note: "Compared to previous month" },
  { title: "Service retention", value: "93%", note: "Repeat customer rate" },
  { title: "Repeat bookings", value: "42", note: "Projects scheduled" },
];

export default function ReportsDashboard() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Performance</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, detail }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#102a33]">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black">Lead pipeline</h3>
          <div className="mt-6 space-y-5">
            {pipeline.map(({ label, count, color }) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <b>{count}</b>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`${color} h-full`} style={{ width: `${Math.min((count / 124) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black">Recent insights</h3>
          <div className="mt-5 space-y-3">
            {recentReports.map((report) => (
              <div key={report.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{report.title}</p>
                <p className="mt-2 text-2xl font-black text-[#102a33]">{report.value}</p>
                <p className="mt-2 text-xs text-slate-500">{report.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
