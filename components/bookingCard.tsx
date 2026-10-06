'use client';
import {useState} from 'react'; import {CalendarDays,MapPin,ArrowRight,CheckCircle2} from 'lucide-react';
export default function BookingCard() {
	const [done, setDone] = useState(false);
	const panelClass = "bg-white/[0.86] backdrop-blur-[14px] shadow-[0_18px_50px_rgba(11,38,48,0.10)] rounded-3xl p-7";

	if (done) {
		return (
			<div id="booking" className={panelClass}>
				<CheckCircle2 className="mb-3 text-emerald-700" size={42} />
				<h3 className="text-2xl font-black">Request received!</h3>
				<p className="mt-2 text-slate-600">
					Our team will contact you shortly to confirm the technician and time slot.
				</p>
			</div>
		);
	}

	return (
		<div id="booking" className={panelClass}>
			<div className="mb-5">
				<p className="text-xs font-black uppercase tracking-widest text-emerald-700">
					Quick booking
				</p>
				<h2 className="mt-1 text-2xl font-black">Book a pest-control service</h2>
			</div>
			<label className="mb-2 block text-sm font-bold">Service</label>
			<select className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3">
				<option>Cockroach Control</option>
				<option>Termite Control</option>
				<option>Bed Bug Control</option>
				<option>Mosquito Control</option>
				<option>Rodent Control</option>
			</select>
			<label className="mb-2 block text-sm font-bold">Property</label>
			<select className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3">
				<option>1 BHK</option>
				<option>2 BHK</option>
				<option>3 BHK</option>
				<option>Office / Shop</option>
			</select>
			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="mb-2 block text-sm font-bold">Date</label>
					<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
						<CalendarDays size={16} /> Select
					</div>
				</div>
				<div>
					<label className="mb-2 block text-sm font-bold">Location</label>
					<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
						<MapPin size={16} /> Mumbai
					</div>
				</div>
			</div>
			<button
				onClick={() => setDone(true)}
				className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white"
			>
				Check Availability <ArrowRight size={17} />
			</button>
		</div>
	);
}
