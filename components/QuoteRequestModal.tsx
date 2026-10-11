"use client";

import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { serviceOptions } from "../lib/technicians";

type QuoteRequestResponse = {
  lead?: { id: string };
  error?: string;
};

export default function QuoteRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [leadId, setLeadId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) setIsOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, isSubmitting]);

  function closeModal() {
    if (isSubmitting) return;
    setIsOpen(false);
    setError("");
    setLeadId("");
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
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
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold"
      >
        Get Quote
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-request-title"
            className="my-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Personalized estimate</p>
                <h2 id="quote-request-title" className="mt-1 text-2xl font-black sm:text-3xl">Request a quotation</h2>
                <p className="mt-2 text-sm text-slate-600">Share a few details and our team will email you a quotation.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close quotation form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {leadId ? (
              <div role="status" className="mt-7 rounded-2xl bg-emerald-50 p-5">
                <h3 className="font-black text-emerald-900">Request received</h3>
                <p className="mt-2 text-sm text-emerald-800">
                  Your lead reference is <strong>{leadId}</strong>. We&apos;ll email your quotation when it is ready.
                </p>
                <button type="button" onClick={closeModal} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="mt-6 grid gap-4 sm:grid-cols-2">
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
                  <select name="service" required defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal outline-none focus:border-emerald-600">
                    <option value="" disabled>Select a service</option>
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">Property type
                  <input name="propertyType" required maxLength={100} placeholder="e.g. 2 BHK apartment" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
                </label>
                <label className="text-sm font-semibold sm:col-span-2">Service address / area
                  <input name="location" required maxLength={300} autoComplete="street-address" placeholder="Area, city and pincode" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
                </label>
                <label className="text-sm font-semibold sm:col-span-2">What do you need help with?
                  <textarea name="issueDetails" required maxLength={2000} rows={4} placeholder="Describe the pest issue, affected areas and any useful details" className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600" />
                </label>
                {error && <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
                  {isSubmitting ? "Submitting..." : "Send quotation request"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
