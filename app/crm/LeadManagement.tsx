"use client";

import { type FormEvent, useState } from "react";
import {
  Clock3,
  Filter,
  IndianRupee,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";

type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Converted";

type Lead = {
  id: string;
  name: string;
  phone: string;
  service: string;
  location: string;
  source: string;
  createdAt: string;
  status: LeadStatus;
  value: number;
  assignee: string;
};

const initialLeads: Lead[] = [
  { id: "LD-1048", name: "Aarav Mehta", phone: "+91 98765 12045", service: "Termite Control", location: "Andheri West, Mumbai", source: "Website", createdAt: "Today, 10:42 AM", status: "New", value: 8500, assignee: "Unassigned" },
  { id: "LD-1047", name: "Priya Sharma", phone: "+91 98201 77890", service: "Cockroach Control", location: "Powai, Mumbai", source: "Google Ads", createdAt: "Today, 9:18 AM", status: "Contacted", value: 3200, assignee: "Rohit" },
  { id: "LD-1046", name: "Kabir Desai", phone: "+91 98190 33412", service: "Bed Bug Control", location: "Bandra East, Mumbai", source: "Referral", createdAt: "Yesterday, 4:35 PM", status: "Qualified", value: 6200, assignee: "Ananya" },
  { id: "LD-1045", name: "Ananya Iyer", phone: "+91 98670 55128", service: "Termite Control", location: "Thane West, Mumbai", source: "Website", createdAt: "Yesterday, 2:10 PM", status: "Proposal", value: 12500, assignee: "Rohit" },
  { id: "LD-1044", name: "Vikram Patel", phone: "+91 98920 88416", service: "Mosquito Control", location: "Malad, Mumbai", source: "Phone call", createdAt: "Oct 4, 11:20 AM", status: "Converted", value: 4800, assignee: "Ananya" },
  { id: "LD-1043", name: "Sara Khan", phone: "+91 97690 44103", service: "Rodent Control", location: "Dadar, Mumbai", source: "Instagram", createdAt: "Oct 3, 3:05 PM", status: "Contacted", value: 5600, assignee: "Rohit" },
];

const leadStatusStyles: Record<LeadStatus, string> = {
  New: "bg-sky-50 text-sky-700 ring-sky-600/15",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-600/15",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-600/15",
  Proposal: "bg-orange-50 text-orange-700 ring-orange-600/15",
  Converted: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
};

export default function LeadManagement() {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const searchText = `${lead.name} ${lead.phone} ${lead.service} ${lead.location} ${lead.id}`.toLowerCase();
    return matchesStatus && searchText.includes(query.trim().toLowerCase());
  });
  const openLeads = leads.filter((lead) => lead.status !== "Converted").length;
  const pipelineValue = leads.filter((lead) => lead.status !== "Converted")
    .reduce((total, lead) => total + lead.value, 0);
  const followUps = leads.filter((lead) => lead.status === "Contacted").length;

  function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const service = String(formData.get("service") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    if (!name || !phone || !service || !location) return;

    setLeads((currentLeads) => [{
      id: `LD-${1049 + currentLeads.length - initialLeads.length}`,
      name, phone, service, location,
      source: "Manual",
      createdAt: "Just now",
      status: "New",
      value: 0,
      assignee: "Unassigned",
    }, ...currentLeads]);
    setStatusFilter("All");
    setQuery("");
    setIsAddLeadOpen(false);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Sales workspace</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Lead management</h2>
          <p className="mt-1 text-sm text-slate-500">Track enquiries and turn new opportunities into customers.</p>
        </div>
        <button onClick={() => setIsAddLeadOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">
          <Plus size={17} /> Add lead
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total leads", value: leads.length, detail: "+12% from last month", icon: Users, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Open opportunities", value: openLeads, detail: "Need your attention", icon: TrendingUp, tone: "bg-blue-50 text-blue-700" },
          { label: "Follow-ups due", value: followUps, detail: "Contact these leads next", icon: Clock3, tone: "bg-amber-50 text-amber-700" },
          { label: "Pipeline value", value: `₹${pipelineValue.toLocaleString("en-IN")}`, detail: "Across open opportunities", icon: IndianRupee, tone: "bg-violet-50 text-violet-700" },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-2xl font-black tracking-tight text-[#102a33]">{value}</p></div>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><h3 className="text-lg font-black">All leads <span className="ml-1 text-sm font-semibold text-slate-400">{filteredLeads.length}</span></h3><p className="mt-1 text-sm text-slate-500">Review and follow up on your latest enquiries.</p></div>
            <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-slate-400 focus-within:border-emerald-600 lg:max-w-xs">
              <Search size={17} />
              <input aria-label="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, service, location..." className="min-w-0 flex-1 text-sm text-slate-800 outline-none placeholder:text-slate-400" />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="mr-1 hidden items-center gap-1 text-xs font-bold text-slate-400 sm:flex"><Filter size={14} />Status</span>
            {(["All", "New", "Contacted", "Qualified", "Proposal", "Converted"] as const).map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${statusFilter === status ? "bg-[#072f29] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{status}</button>
            ))}
            <span className="ml-auto hidden shrink-0 items-center gap-1 text-xs font-medium text-slate-400 md:flex"><SlidersHorizontal size={14} /> Updated recently</span>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr><th className="px-5 py-3">Lead</th><th className="px-4 py-3">Service & location</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><p className="font-bold text-slate-800">{lead.name}</p><p className="mt-1 text-xs text-slate-500">{lead.phone} · {lead.id}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-700">{lead.service}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} />{lead.location}</p></td>
                  <td className="px-4 py-4 text-slate-600">{lead.source}</td><td className="whitespace-nowrap px-4 py-4 text-slate-500">{lead.createdAt}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${leadStatusStyles[lead.status]}`}>{lead.status}</span></td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">{lead.value ? `₹${lead.value.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-4 py-4 text-slate-600">{lead.assignee}</td><td className="px-4 py-4"><button aria-label={`More actions for ${lead.name}`} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={19} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && <EmptyLeads />}
        </div>
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredLeads.map((lead) => (
            <article key={lead.id} className="p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-bold text-slate-800">{lead.name}</h4><p className="mt-1 text-xs text-slate-500">{lead.phone}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${leadStatusStyles[lead.status]}`}>{lead.status}</span></div>
              <p className="mt-3 text-sm font-semibold text-slate-700">{lead.service}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} />{lead.location}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{lead.id} · {lead.source}</span><span>{lead.value ? `₹${lead.value.toLocaleString("en-IN")}` : "Value pending"}</span></div>
            </article>
          ))}
          {filteredLeads.length === 0 && <EmptyLeads />}
        </div>
      </div>

      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4" onClick={() => setIsAddLeadOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="add-lead-title" className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5"><p className="text-sm font-semibold text-emerald-700">New opportunity</p><h3 id="add-lead-title" className="mt-1 text-xl font-black">Add a lead</h3><p className="mt-1 text-sm text-slate-500">Enter the customer details to add them to your lead list.</p></div>
            <form onSubmit={addLead} className="space-y-4">
              <LeadField label="Customer name" name="name" placeholder="e.g. Riya Kapoor" />
              <LeadField label="Phone number" name="phone" placeholder="+91 98765 43210" type="tel" />
              <LeadField label="Service required" name="service" placeholder="e.g. Termite Control" />
              <LeadField label="Service location" name="location" placeholder="Area, city" />
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsAddLeadOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Save lead</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function LeadField({ label, name, placeholder, type = "text" }: { label: string; name: string; placeholder: string; type?: string }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<input name={name} type={type} required placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" /></label>;
}

function EmptyLeads() {
  return <p className="px-5 py-10 text-center text-sm text-slate-500">No leads match your search. Try another filter or add a lead.</p>;
}
