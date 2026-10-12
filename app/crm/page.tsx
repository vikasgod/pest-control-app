"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isPending && role === "customer") {
      router.replace("/");
    }
  }, [isPending, role, router]);

  if (isPending) {
    return <main className="grid min-h-screen place-items-center">Loading CRM...</main>;
  }

  if (!session || !role) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8f7] p-6">
        <section className="max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">Sign in to Pestquro CRM</h1>
          <p className="mt-2 text-slate-600">Log in to view your account and services.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Sign in</Link>
        </section>
      </main>
    );
  }

  if (role === "customer") {
    return <main className="grid min-h-screen place-items-center">Returning to the customer website...</main>;
  }

  const visibleNav = role === "admin" ? adminNav : role === "manager" ? managerNav : technicianNav;
  return (
    <div className="min-h-screen bg-[#f5f8f7] text-[#102a33]">
      <aside className="fixed hidden h-screen w-64 border-r bg-[#072f29] p-5 text-white md:block">
        <Link href="/crm" className="text-2xl font-black">Pestquro<span className="text-emerald-300">.</span></Link>
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
