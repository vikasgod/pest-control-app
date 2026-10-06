"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { type CrmRole, roleLabels } from "./roles";
import LeadManagement from "./LeadManagement";

const adminNav = [
  ["Overview", LayoutDashboard],
  ["Leads", Users],
  ["Bookings", CalendarCheck],
  ["Customers", UserRound],
  ["Technicians", UserRound],
  ["Payments", IndianRupee],
  ["Services", Settings],
] as const;

const agentNav = [
  ["Overview", LayoutDashboard],
  ["Leads", Users],
  ["Bookings", CalendarCheck],
  ["Technicians", UserRound],
] as const;

const bookings = [
  ["PC-10245", "Rahul Sharma", "Cockroach Control", "Today, 10:00 AM", "Rajesh", "Confirmed"],
  ["PC-10244", "Priya Mehta", "Termite Control", "Today, 1:30 PM", "Amit", "Assigned"],
  ["PC-10243", "Amit Verma", "Bed Bug Control", "Tomorrow, 11:00 AM", "Sunil", "Pending"],
  ["PC-10242", "Neha Shah", "Mosquito Control", "Tomorrow, 4:00 PM", "Rajesh", "Completed"],
];

export default function CRM() {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const { data: session, isPending } = authClient.useSession();
  const sessionRole = session
    ? (session.user as typeof session.user & { role?: string }).role
    : undefined;
  const role: CrmRole | null =
    sessionRole === "admin" || sessionRole === "agent" || sessionRole === "user"
      ? sessionRole
      : session
        ? "user"
        : null;

  if (isPending) {
    return <main className="grid min-h-screen place-items-center">Loading CRM...</main>;
  }

  if (!session || !role) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8f7] p-6">
        <section className="max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">Sign in to Pestora CRM</h1>
          <p className="mt-2 text-slate-600">Log in to view your account and services.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Sign in</Link>
        </section>
      </main>
    );
  }

  if (role === "user") {
    return (
      <div className="min-h-screen bg-[#f5f8f7] p-5 text-[#102a33] md:p-10">
        <main className="mx-auto max-w-3xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href="/" className="text-2xl font-black">Pestora<span className="text-emerald-700">.</span></Link>
              <p className="text-sm text-slate-500">Your customer profile</p>
            </div>
            <button onClick={() => authClient.signOut().then(() => router.push("/login"))} className="rounded-xl border px-4 py-2 text-sm font-bold">Sign out</button>
          </header>
          <section className="rounded-3xl border bg-white p-6 shadow-sm md:p-9">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                <UserRound size={30} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">My profile</p>
                <h1 className="text-2xl font-black">{session.user.name}</h1>
              </div>
            </div>
            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              <ProfileDetail label="Email" value={session.user.email} />
              <ProfileDetail label="Account type" value={roleLabels[role]} />
              <ProfileDetail label="Phone" value="Not added yet" />
              <ProfileDetail label="Service address" value="Not added yet" />
            </dl>
            <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
              <h2 className="font-black">Service details</h2>
              <p className="mt-2 text-sm text-slate-600">Your service history will appear here when it is linked to your account.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const visibleNav = role === "admin" ? adminNav : agentNav;
  return (
    <div className="min-h-screen bg-[#f5f8f7] text-[#102a33]">
      <aside className="fixed hidden h-screen w-64 border-r bg-[#072f29] p-5 text-white md:block">
        <Link href="/crm" className="text-2xl font-black">Pestora<span className="text-emerald-300">.</span></Link>
        <p className="mt-1 text-xs text-white/50">Business CRM · {roleLabels[role]}</p>
        <nav className="mt-10 space-y-2">
          {visibleNav.map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${active === name ? "bg-white text-[#072f29]" : "text-white/70 hover:bg-white/10"}`}
            >
              <Icon size={18} />{name}
            </button>
          ))}
          {role === "admin" && (
            <Link
              href="/crm/blog/create"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/10"
            >
              <Plus size={18} />Blog
            </Link>
          )}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-white/10 p-4">
          <p className="text-xs text-white/50">Logged in as</p>
          <b>{roleLabels[role]}</b>
          <p className="mt-1 text-xs text-emerald-300">{role === "admin" ? "Full access" : "Operations access"}</p>
        </div>
      </aside>
      <main className="md:ml-64">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b bg-white/90 px-5 py-4 backdrop-blur md:px-8">
          <div>
            <h1 className="text-xl font-black">{active}</h1>
            <p className="text-xs text-slate-500">Manage your pest-control business</p>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <div className="hidden items-center gap-2 rounded-xl border bg-white px-3 py-2 md:flex">
              <Search size={16} /><input className="w-40 outline-none" placeholder="Search..." />
            </div>
            {role === "admin" && (
              <Link href="/crm/blog/create" className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white">
                Create blog
              </Link>
            )}
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-semibold sm:inline">{session.user.name} · {roleLabels[role]}</span>
              <button onClick={() => authClient.signOut().then(() => router.push("/login"))} className="whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-bold">Sign out</button>
            </div>
          </div>
        </header>
        <nav aria-label="CRM sections" className="flex gap-2 overflow-x-auto border-b bg-white px-5 py-3 md:hidden">
          {visibleNav.map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              aria-current={active === name ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${active === name ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Icon size={16} />{name}
            </button>
          ))}
          {role === "admin" && (
            <Link href="/crm/blog/create" className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
              <Plus size={16} />Blog
            </Link>
          )}
        </nav>
        <div className="p-4 sm:p-5 md:p-8">
          {active === "Leads" ? <LeadManagement /> : (
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
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}
