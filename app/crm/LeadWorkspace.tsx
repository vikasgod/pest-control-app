"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import type { CrmRole } from "./roles";

type LeadStatus = "New" | "Assigned" | "Quoted" | "Accepted" | "Declined";

type Lead = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  service: string;
  propertyType: string;
  issueDetails: string;
  source: string;
  status: LeadStatus;
  managerName?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  quoteAmount?: number;
  quoteDetails?: string;
  createdAt: string;
};

type Technician = { id: string; name: string };

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-sky-50 text-sky-700",
  Assigned: "bg-amber-50 text-amber-700",
  Quoted: "bg-violet-50 text-violet-700",
  Accepted: "bg-emerald-50 text-emerald-700",
  Declined: "bg-rose-50 text-rose-700",
};

export default function LeadWorkspace({ role }: { role: CrmRole }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<Record<string, string>>({});
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, { amount: string; details: string }>>({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/leads");
      const result: { leads?: Lead[]; technicians?: Technician[]; error?: string } = await response.json();
      if (!response.ok || !result.leads) throw new Error(result.error ?? "Unable to load leads.");
      setLeads(result.leads);
      setTechnicians(result.technicians ?? []);
      setSelectedTechnicians((current) => {
        const next = { ...current };
        for (const lead of result.leads ?? []) {
          if (lead.assignedTechnicianId) next[lead.id] = lead.assignedTechnicianId;
        }
        return next;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) =>
      `${lead.customerName} ${lead.phone} ${lead.email} ${lead.service} ${lead.location} ${lead.id}`
        .toLowerCase()
        .includes(term),
    );
  }, [leads, search]);

  async function assignLead(lead: Lead) {
    const technicianId = selectedTechnicians[lead.id];
    if (!technicianId) {
      setError("Select a technician before assigning this lead.");
      return;
    }
    setSavingId(lead.id);
    setError("");
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, technicianId }),
      });
      const result: { lead?: Lead; error?: string } = await response.json();
      if (!response.ok || !result.lead) throw new Error(result.error ?? "Unable to assign this lead.");
      setLeads((current) => current.map((item) => item.id === lead.id ? result.lead! : item));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to assign this lead.");
    } finally {
      setSavingId("");
    }
  }

  async function sendQuote(event: FormEvent<HTMLFormElement>, lead: Lead) {
    event.preventDefault();
    const draft = quoteDrafts[lead.id] ?? { amount: "", details: "" };
    setSavingId(lead.id);
    setError("");
    try {
      const response = await fetch("/api/leads/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, amount: Number(draft.amount), details: draft.details }),
      });
      const result: { lead?: { id: string; status: LeadStatus }; error?: string } = await response.json();
      if (!response.ok || !result.lead) throw new Error(result.error ?? "Unable to send the quotation.");
      setLeads((current) => current.map((item) =>
        item.id === lead.id ? { ...item, status: result.lead!.status, quoteAmount: Number(draft.amount), quoteDetails: draft.details } : item,
      ));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to send the quotation.");
    } finally {
      setSavingId("");
    }
  }

  const counts = {
    new: leads.filter((lead) => lead.status === "New").length,
    assigned: leads.filter((lead) => lead.status === "Assigned").length,
    quoted: leads.filter((lead) => lead.status === "Quoted").length,
    accepted: leads.filter((lead) => lead.status === "Accepted").length,
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Quotation requests</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            {role === "technician" ? "My assigned leads" : "Lead management"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {role === "technician"
              ? "Review customer requests and send your quotation by email."
              : "Review website requests, assign a technician and follow the quotation response."}
          </p>
        </div>
        <button onClick={() => void loadLeads()} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">
          {loading ? "Refreshing..." : "Refresh leads"}
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["New", counts.new],
          ["Assigned", counts.assigned],
          ["Quotation sent", counts.quoted],
          ["Accepted", counts.accepted],
        ].map(([label, count]) => (
          <div key={label} className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black">{count}</p>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-400 sm:max-w-md">
        <Search size={17} />
        <input aria-label="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, service or location" className="min-w-0 flex-1 text-sm text-slate-800 outline-none" />
      </label>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? (
        <p className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Loading leads...</p>
      ) : visibleLeads.length === 0 ? (
        <p className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
          {leads.length ? "No leads match your search." : "No quotation requests yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleLeads.map((lead) => (
            <article key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400">{lead.id} · {new Date(lead.createdAt).toLocaleString("en-IN")}</p>
                  <h3 className="mt-1 text-lg font-black">{lead.customerName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{lead.phone} · {lead.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[lead.status]}`}>{lead.status}</span>
              </div>

              <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="font-bold text-slate-800">{lead.service} · {lead.propertyType}</p>
                  <p className="mt-1 flex items-start gap-1 text-slate-600"><MapPin size={15} className="mt-0.5 shrink-0" />{lead.location}</p>
                  <p className="mt-3 whitespace-pre-wrap leading-6 text-slate-700">{lead.issueDetails}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assignment & quotation</p>
                  {lead.assignedTechnicianName && <p className="mt-2 text-sm text-slate-700">Technician: <strong>{lead.assignedTechnicianName}</strong></p>}
                  {lead.quoteAmount !== undefined && <p className="mt-2 text-sm text-slate-700">Quote: <strong>₹{lead.quoteAmount.toLocaleString("en-IN")}</strong></p>}
                  {lead.quoteDetails && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{lead.quoteDetails}</p>}

                  {(role === "admin" || role === "manager") && (lead.status === "New" || lead.status === "Assigned") && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <select aria-label={`Assign technician to ${lead.customerName}`} value={selectedTechnicians[lead.id] ?? ""} onChange={(event) => setSelectedTechnicians((current) => ({ ...current, [lead.id]: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                        <option value="">Select technician</option>
                        {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name}</option>)}
                      </select>
                      <button disabled={savingId === lead.id || technicians.length === 0} onClick={() => void assignLead(lead)} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {savingId === lead.id ? "Saving..." : "Assign"}
                      </button>
                    </div>
                  )}

                  {role === "technician" && lead.status === "Assigned" && (
                    <form onSubmit={(event) => void sendQuote(event, lead)} className="mt-4 space-y-3">
                      <label className="block text-sm font-semibold">Quotation amount (₹)
                        <input type="number" min="1" max="10000000" step="1" required value={quoteDrafts[lead.id]?.amount ?? ""} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [lead.id]: { amount: event.target.value, details: current[lead.id]?.details ?? "" } }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal" />
                      </label>
                      <label className="block text-sm font-semibold">Treatment proposal / response
                        <textarea required maxLength={2000} rows={3} value={quoteDrafts[lead.id]?.details ?? ""} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [lead.id]: { amount: current[lead.id]?.amount ?? "", details: event.target.value } }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal" />
                      </label>
                      <button disabled={savingId === lead.id} className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                        {savingId === lead.id ? "Sending..." : "Email quotation to customer"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
