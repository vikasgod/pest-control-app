"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock3,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { type CrmRole, roleLabels } from "./roles";
import { CrmModuleRenderer } from "../../components/CrmModuleRenderer";

const adminNav = [
  ["Dashboard", LayoutDashboard],
  ["Leads", Users],
  ["Customers", UserRound],
  ["Staff", UserRound],
  ["Services", Settings],
  ["Bookings", CalendarCheck],
  ["Reports", TrendingUp],
] as const;

const managerNav = [
  ["Dashboard", LayoutDashboard],
  ["Leads", Users],
  ["Customers", UserRound],
  ["Staff", UserRound],
  ["Schedule", CalendarCheck],
  ["Bookings", CalendarCheck],
  ["Follow-ups", Clock3],
] as const;

const technicianNav = [
  ["Dashboard", LayoutDashboard],
  ["Assigned Leads", Users],
  ["Assigned Jobs", CalendarCheck],
  ["Job Details", CalendarCheck],
  ["Service Report", TrendingUp],
  ["Profile", Settings],
] as const;

export default function CRM() {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const { data: session, isPending } = authClient.useSession();
  const sessionRole = session
    ? (session.user as typeof session.user & { role?: string }).role
    : undefined;
  const role: CrmRole | null =
    sessionRole === "admin" || sessionRole === "manager" || sessionRole === "technician" || sessionRole === "customer"
      ? sessionRole
      : session
        ? "customer"
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

  if (role === "customer") {
    return (
      <div className="min-h-screen bg-[#f5f8f7] p-5 text-[#102a33] md:p-10">
        <main className="mx-auto max-w-4xl">
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
              <ProfileDetail label="Phone" value="+91 98765 43210" />
              <ProfileDetail label="Service address" value="Bandra West, Mumbai" />
            </dl>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-5">
                <h2 className="font-black">Pest control service details</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li><span className="font-bold text-slate-900">Issue:</span> Cockroach infestation in kitchen and storage area</li>
                  <li><span className="font-bold text-slate-900">Property type:</span> 2 BHK apartment</li>
                  <li><span className="font-bold text-slate-900">Preferred date:</span> Saturday, 10:30 AM</li>
                  <li><span className="font-bold text-slate-900">Treatment plan:</span> Deep spray + preventive sealing</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-black">Service journey</h2>
                <div className="mt-4 space-y-4 text-sm text-slate-700">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="font-bold text-slate-900">Lead generated</p>
                    <p className="mt-1">Customer inquiry received and assigned to a manager.</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="font-bold text-slate-900">Inspection scheduled</p>
                    <p className="mt-1">Site review by technician before final treatment plan.</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="font-bold text-slate-900">Follow-up care</p>
                    <p className="mt-1">Post-treatment support and quarterly prevention check.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const visibleNav = role === "admin" ? adminNav : role === "manager" ? managerNav : technicianNav;
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
          <p className="mt-1 text-xs text-emerald-300">
            {role === "admin" ? "Full access" : role === "manager" ? "Team oversight" : role === "technician" ? "Field operations" : "Customer access"}
          </p>
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
          <CrmModuleRenderer active={active} role={role} managerName={session.user.name} />
        </div>
      </main>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}
