"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Quote = {
  customerName: string;
  service: string;
  amount: number;
  details: string;
  expiresAt: string;
};

export default function CustomerQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/quotes/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const result: { quote?: Quote; error?: string } = await response.json();
        if (!response.ok || !result.quote) throw new Error(result.error ?? "Unable to load this quotation.");
        if (active) setQuote(result.quote);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load this quotation.");
      });
    return () => { active = false; };
  }, [token]);

  async function respond(value: "Accepted" | "Declined") {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quotes/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: value }),
      });
      const result: { status?: string; error?: string } = await response.json();
      if (!response.ok || !result.status) throw new Error(result.error ?? "Unable to record your response.");
      setDecision(result.status);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to record your response.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f8f7] px-4 py-10 text-[#102a33]">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-bold text-emerald-700">Pestquro.</Link>
        {decision ? (
          <div role="status" className="mt-8 rounded-2xl bg-emerald-50 p-5">
            <h1 className="text-2xl font-black">{decision === "Accepted" ? "Quotation accepted" : "Quotation declined"}</h1>
            <p className="mt-2 text-sm text-slate-700">Thank you. Pestquro has recorded your response and the service team will follow up with you.</p>
          </div>
        ) : quote ? (
          <>
            <p className="mt-8 text-sm font-bold uppercase tracking-widest text-emerald-700">Your service quotation</p>
            <h1 className="mt-2 text-3xl font-black">Hello {quote.customerName}</h1>
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
              <p className="font-bold">{quote.service}</p>
              <p className="mt-3 text-3xl font-black">₹{quote.amount.toLocaleString("en-IN")}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{quote.details}</p>
              <p className="mt-4 text-xs text-slate-500">Valid until {new Date(quote.expiresAt).toLocaleDateString("en-IN")}</p>
            </div>
            <p className="mt-5 text-sm text-slate-600">Please accept or decline this quotation. Your response will update the service team&apos;s lead status.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button disabled={isSubmitting} onClick={() => respond("Accepted")} className="flex-1 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-60">{isSubmitting ? "Saving..." : "Accept quotation"}</button>
              <button disabled={isSubmitting} onClick={() => respond("Declined")} className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 disabled:opacity-60">Decline</button>
            </div>
          </>
        ) : (
          <div role={error ? "alert" : "status"} className={`mt-8 rounded-2xl p-5 ${error ? "bg-red-50 text-red-800" : "bg-slate-50 text-slate-600"}`}>
            {error || "Loading your quotation..."}
          </div>
        )}
        {error && quote && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
      </section>
    </main>
  );
}
