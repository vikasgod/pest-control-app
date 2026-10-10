"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { serviceOptions, timeSlotOptions } from "../lib/technicians";

function getToday() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function BookingCard() {
  const router = useRouter();
  const [service, setService] = useState<string>(serviceOptions[0]);
  const [pincode, setPincode] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState<string>(timeSlotOptions[0]);
  const panelClass = "rounded-3xl bg-white/[0.86] p-7 shadow-[0_18px_50px_rgba(11,38,48,0.10)] backdrop-blur-[14px]";

  function checkAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ service, pincode, date, timeSlot });
    router.push(`/search?${params.toString()}`);
  }

	return (
		<div id="booking" className={panelClass}>
			<div className="mb-5">
				<p className="text-xs font-black uppercase tracking-widest text-emerald-700">
					Check service availability
				</p>
				<h2 className="mt-1 text-2xl font-black">Find a technician near you</h2>
			</div>
			<form onSubmit={checkAvailability}>
				<label htmlFor="booking-service" className="mb-2 block text-sm font-bold">Service</label>
				<select id="booking-service" value={service} onChange={(event) => setService(event.target.value)} required className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3">
					{serviceOptions.map((option) => <option key={option}>{option}</option>)}
				</select>
				<label htmlFor="booking-pincode" className="mb-2 block text-sm font-bold">Service pincode</label>
				<div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
					<MapPin size={17} className="shrink-0 text-slate-500" />
					<input
						id="booking-pincode"
						value={pincode}
						onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
						inputMode="numeric"
						pattern="\d{6}"
						maxLength={6}
						placeholder="Enter 6-digit pincode"
						required
						className="w-full py-3 outline-none"
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label htmlFor="booking-date" className="mb-2 block text-sm font-bold">Date</label>
						<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
							<CalendarDays size={17} className="shrink-0 text-slate-500" />
							<input id="booking-date" type="date" min={getToday()} value={date} onChange={(event) => setDate(event.target.value)} required className="min-w-0 w-full py-3 text-sm outline-none" />
						</div>
					</div>
					<div>
						<label htmlFor="booking-time" className="mb-2 block text-sm font-bold">Time slot</label>
						<select id="booking-time" value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
							{timeSlotOptions.map((option) => <option key={option}>{option}</option>)}
						</select>
					</div>
				</div>
				<button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white">
					Check Availability <ArrowRight size={17} />
				</button>
			</form>
		</div>
	);
}
