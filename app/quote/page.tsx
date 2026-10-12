"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

type QuoteRequestResponse = {
  lead?: { id: string };
  error?: string;
};

export default function QuoteRequestPage() {
  const [error, setError] = useState("");
  const [leadId, setLeadId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result: QuoteRequestResponse = await response.json();
      if (!response.ok || !result.lead) {
        throw new Error(result.error ?? "Unable to submit your quotation request.");
      }
      setLeadId(result.lead.id);
      form.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your quotation request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8f7] px-4 py-10 text-[#102a33] sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-bold text-emerald-700">← Back to Pestquro</Link>
        <p className="mt-7 text-sm font-bold uppercase tracking-widest text-emerald-700">Personalized estimate</p>
        <h1 className="mt-2 text-3xl font-black">Request a quotation</h1>
        <p className="mt-2 text-slate-600">Tell us what you need. Our team will review your request and email you a quotation.</p>

        {leadId ? (
          <div role="status" className="mt-8 rounded-2xl bg-emerald-50 p-5">
            <h2 className="font-black text-emerald-900">Request received</h2>
            <p className="mt-2 text-sm text-emerald-800">Your lead reference is <strong>{leadId}</strong>. We&apos;ll email your quotation when it is ready.</p>
            <button onClick={() => setLeadId("")} className="mt-4 text-sm font-bold text-emerald-800 underline">Submit another request</button>
          </div>
        ) : (
          <form onSubmit={submitRequest} className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">Your name
              <input name="customerName" required maxLength={100} autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            <label className="text-sm font-semibold">Phone number
              <input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">Email for quotation
              <input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            <label className="text-sm font-semibold">Service required
              <input name="service" required maxLength={120} placeholder="e.g. Termite control" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            <label className="text-sm font-semibold">Property type
              <input name="propertyType" required maxLength={100} placeholder="e.g. 2 BHK apartment" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">Service address / area
              <input name="location" required maxLength={300} autoComplete="street-address" placeholder="Area, city and pincode" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">What do you need help with?
              <textarea name="issueDetails" required maxLength={2000} rows={5} placeholder="Describe the pest issue, affected areas and any useful details" className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
              {isSubmitting ? "Submitting..." : "Send quotation request"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
