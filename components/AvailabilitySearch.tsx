"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { serviceOptions, timeSlotOptions } from "../lib/technicians";

type Technician = {
  id: string;
  name: string;
  team: string;
  location: string;
  pincode: string;
};

type AvailabilityResponse = {
  service?: string;
  pincode?: string;
  date?: string;
  timeSlot?: string;
  technicians?: Technician[];
  error?: string;
};

function getToday() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function AvailabilitySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [service, setService] = useState<string>(serviceOptions[0]);
  const [pincode, setPincode] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState<string>(timeSlotOptions[0]);
  const [technicians, setTechnicians] = useState<Technician[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const searchValues = useMemo(() => new URLSearchParams(query), [query]);

  useEffect(() => {
    const nextService = searchValues.get("service") ?? "";
    const nextPincode = searchValues.get("pincode") ?? "";
    const nextDate = searchValues.get("date") ?? "";
    const nextTimeSlot = searchValues.get("timeSlot") ?? "";

    setService(serviceOptions.some((option) => option === nextService) ? nextService : serviceOptions[0]);
    setPincode(nextPincode.replace(/\D/g, "").slice(0, 6));
    setDate(nextDate);
    setTimeSlot(timeSlotOptions.some((option) => option === nextTimeSlot) ? nextTimeSlot : timeSlotOptions[0]);
  }, [searchValues]);

  useEffect(() => {
    const requestedService = searchValues.get("service");
    const requestedPincode = searchValues.get("pincode");
    const requestedDate = searchValues.get("date");
    const requestedTimeSlot = searchValues.get("timeSlot");
    const isCompleteSearch =
      serviceOptions.some((option) => option === requestedService) &&
      requestedPincode !== null &&
      /^\d{6}$/.test(requestedPincode) &&
      requestedDate !== null &&
      /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) &&
      timeSlotOptions.some((option) => option === requestedTimeSlot);

    if (!isCompleteSearch) {
      setTechnicians(null);
      setError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setTechnicians(null);
    setError("");

    fetch(`/api/availability?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const result: AvailabilityResponse = await response.json();
        if (!response.ok) {
          throw new Error(result.error ?? "Unable to check technician availability.");
        }
        setTechnicians(result.technicians ?? []);
      })
      .catch((searchError: unknown) => {
        if (searchError instanceof Error && searchError.name === "AbortError") return;
        setError(searchError instanceof Error ? searchError.message : "Unable to check technician availability.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false);
      });

    return () => controller.abort();
  }, [query, searchValues]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ service, pincode, date, timeSlot });
    router.push(`/search?${params.toString()}`);
  }

  function resetSearch() {
    setService(serviceOptions[0]);
    setPincode("");
    setDate("");
    setTimeSlot(timeSlotOptions[0]);
    setTechnicians(null);
    setError("");
    router.replace("/search");
  }

  const searchLabel = searchValues.has("service") ? "Search again" : "Search availability";

  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#f5f8f7] px-4 py-10 text-[#102a33] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800">
          <ArrowLeft size={17} /> Back to home
        </Link>

        <div className="mt-6">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Technician search</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Check service availability</h1>
          <p className="mt-2 text-slate-600">Search available technicians by service, pincode, date and time slot.</p>
        </div>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={submitSearch}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label htmlFor="search-service" className="text-sm font-bold text-slate-700">
                Service
                <select id="search-service" value={service} onChange={(event) => setService(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-emerald-600">
                  {serviceOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label htmlFor="search-pincode" className="text-sm font-bold text-slate-700">
                Service pincode
                <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <MapPin size={17} className="shrink-0 text-slate-500" />
                  <input id="search-pincode" value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="6-digit pincode" required className="w-full py-3 outline-none" />
                </span>
              </label>
              <label htmlFor="search-date" className="text-sm font-bold text-slate-700">
                Date
                <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <CalendarDays size={17} className="shrink-0 text-slate-500" />
                  <input id="search-date" type="date" min={getToday()} value={date} onChange={(event) => setDate(event.target.value)} required className="w-full min-w-0 py-3 text-sm outline-none" />
                </span>
              </label>
              <label htmlFor="search-time" className="text-sm font-bold text-slate-700">
                Time slot
                <select id="search-time" value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-600">
                  {timeSlotOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={resetSearch} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <RotateCcw size={16} /> Reset
              </button>
              <button type="submit" disabled={isSearching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                <Search size={17} /> {isSearching ? "Searching..." : searchLabel}
              </button>
            </div>
          </form>
        </section>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}

        {isSearching && <p role="status" className="mt-6 text-center text-sm font-medium text-slate-600">Searching available technicians...</p>}

        {technicians !== null && (
          <section aria-live="polite" className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-black">Available technicians</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {service} · {date} · {timeSlot} · {pincode}
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-800">{technicians.length} found</span>
            </div>
            {technicians.length ? (
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {technicians.map((technician) => (
                  <li key={technician.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                    <div>
                      <p className="flex items-center gap-2 font-black text-slate-900">
                        <CheckCircle2 size={19} className="text-emerald-700" /> {technician.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{technician.team}</p>
                      <p className="mt-1 text-sm text-slate-600">{technician.location} · {technician.pincode}</p>
                    </div>
                    <a
                      href={`/services?${new URLSearchParams({
                        technicianId: technician.id,
                        technicianName: technician.name,
                        service,
                        pincode,
                        date,
                        timeSlot,
                      }).toString()}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                    >
                      Services
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                No available technician found for this service and pincode. Try changing your search details.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
