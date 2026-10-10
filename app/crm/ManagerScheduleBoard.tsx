const schedule = [
  { day: "Mon", team: "North zone", task: "4 inspections", technician: "Nikhil Verma" },
  { day: "Tue", team: "Western zone", task: "3 quotes", technician: "Ananya Joshi" },
  { day: "Wed", team: "Commercial", task: "2 follow-ups", technician: "Mehul Shah" },
  { day: "Thu", team: "Residential", task: "5 service calls", technician: "Rohit Sethi" },
];

export default function ManagerScheduleBoard() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Operations</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Schedule</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {schedule.map(({ day, team, task, technician }) => (
          <div key={day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">{day}</p>
            <h3 className="mt-3 text-lg font-black text-[#102a33]">{team}</h3>
            <p className="mt-2 text-sm text-slate-600">{task}</p>
            <p className="mt-4 text-xs font-bold text-emerald-700">{technician}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
