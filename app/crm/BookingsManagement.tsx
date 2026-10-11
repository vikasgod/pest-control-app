"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarDays, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { timeSlotOptions } from "../../lib/technicians";
import type { CrmRole } from "./roles";

type Booking = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  categoryName: string;
  serviceName: string;
  price: number;
  technicianId: string;
  technicianName: string;
  requestedService: string;
  pincode: string;
  date: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string;
};

type Technician = {
  id: string;
  name: string;
  pincode?: string;
  services: string[];
};

type BookingForm = Pick<
  Booking,
  "customerName" | "phone" | "email" | "address" | "pincode" | "date" | "timeSlot" | "technicianId" | "status"
>;

const emptyForm: BookingForm = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  pincode: "",
  date: "",
  timeSlot: timeSlotOptions[0],
  technicianId: "",
  status: "Pending",
};

function toBookingForm(booking: Booking): BookingForm {
  return {
    customerName: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    address: booking.address,
    pincode: booking.pincode,
    date: booking.date,
    timeSlot: booking.timeSlot,
    technicianId: booking.technicianId,
    status: booking.status,
  };
}

export default function BookingsManagement({ role }: { role: CrmRole }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/bookings");
      const result: { bookings?: Booking[]; technicians?: Technician[]; error?: string } = await response.json();
      if (!response.ok || !result.bookings) throw new Error(result.error ?? "Unable to load bookings.");
      setBookings(result.bookings);
      setTechnicians(result.technicians ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  function startEditing(booking: Booking) {
    setError("");
    setEditingBooking(booking);
    setForm(toBookingForm(booking));
  }

  function closeEditor() {
    if (saving) return;
    setEditingBooking(null);
    setForm(emptyForm);
    setError("");
  }

  async function saveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingBooking) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBooking.id, ...form }),
      });
      const result: { booking?: Booking; error?: string } = await response.json();
      if (!response.ok || !result.booking) throw new Error(result.error ?? "Unable to update booking.");
      setBookings((current) => current.map((booking) =>
        booking.id === result.booking!.id ? result.booking! : booking,
      ));
      setEditingBooking(null);
      setForm(emptyForm);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update booking.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBooking() {
    if (!deletingBooking) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingBooking.id }),
      });
      const result: { deleted?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.deleted) throw new Error(result.error ?? "Unable to delete booking.");
      setBookings((current) => current.filter((booking) => booking.id !== deletingBooking.id));
      setDeletingBooking(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete booking.");
      setDeletingBooking(null);
    } finally {
      setSaving(false);
    }
  }

  const activeBookings = bookings.filter((booking) => booking.status !== "Cancelled").length;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Service operations · {role === "manager" ? "Manager" : "Admin"}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Bookings</h2>
          <p className="mt-1 text-sm text-slate-500">Bookings fetched from the database. Edit customer details, schedule or technician assignment.</p>
        </div>
        <button onClick={() => void loadBookings()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">
          <RefreshCw size={16} />{loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total bookings", bookings.length],
          ["Active bookings", activeBookings],
          ["Pending", bookings.filter((booking) => booking.status === "Pending").length],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </article>
        ))}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <CalendarDays className="mx-auto text-slate-400" />
          <p className="mt-3 font-bold">No bookings found</p>
          <p className="mt-1 text-sm text-slate-500">New customer bookings will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Customer</th><th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Date & time</th><th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-5 py-4"><p className="font-bold">{booking.customerName}</p><p className="mt-1 text-xs text-slate-500">{booking.phone} · {booking.email}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{booking.address}</p></td>
                    <td className="px-4 py-4"><p className="font-semibold">{booking.serviceName}</p><p className="mt-1 text-xs text-slate-500">{booking.categoryName} · {booking.requestedService}</p></td>
                    <td className="whitespace-nowrap px-4 py-4"><p>{booking.date}</p><p className="mt-1 text-xs text-slate-500">{booking.timeSlot}</p></td>
                    <td className="px-4 py-4">{booking.technicianName}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold">₹{booking.price.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : booking.status === "Cancelled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{booking.status}</span></td>
                    <td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => startEditing(booking)} aria-label={`Edit booking for ${booking.customerName}`} className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"><Pencil size={15} /></button><button onClick={() => setDeletingBooking(booking)} aria-label={`Delete booking for ${booking.customerName}`} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-100 md:hidden">
            {bookings.map((booking) => (
              <article key={booking.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{booking.customerName}</h3><p className="text-xs text-slate-500">{booking.phone} · {booking.email}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : booking.status === "Cancelled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{booking.status}</span></div>
                <div><p className="font-semibold">{booking.serviceName}</p><p className="text-sm text-slate-500">{booking.date} · {booking.timeSlot}</p><p className="text-sm text-slate-500">Technician: {booking.technicianName} · ₹{booking.price.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-slate-500">{booking.address}</p></div>
                <div className="flex gap-2"><button onClick={() => startEditing(booking)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold"><Pencil size={14} />Edit</button><button onClick={() => setDeletingBooking(booking)} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600"><Trash2 size={14} />Delete</button></div>
              </article>
            ))}
          </div>
        </div>
      )}

      {editingBooking && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="edit-booking-title" className="my-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-emerald-700">{editingBooking.id}</p><h3 id="edit-booking-title" className="text-xl font-black">Edit booking</h3></div>
              <button onClick={closeEditor} aria-label="Close edit booking form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={saveBooking} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Customer name<input required maxLength={100} value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Phone<input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Address<input required maxLength={500} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Pincode<input required inputMode="numeric" maxLength={6} pattern="\d{6}" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Time slot<select value={form.timeSlot} onChange={(event) => setForm({ ...form, timeSlot: event.target.value })} className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 font-normal">{timeSlotOptions.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
              <label className="text-sm font-semibold">Technician<select required value={form.technicianId} onChange={(event) => setForm({ ...form, technicianId: event.target.value })} className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 font-normal">{technicians.filter((technician) => technician.pincode === form.pincode && technician.services.includes(editingBooking.requestedService)).map((technician) => <option key={technician.id} value={technician.id}>{technician.name}</option>)}</select></label>
              <label className="text-sm font-semibold">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as BookingForm["status"] })} className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 font-normal"><option value="Pending">Pending</option><option value="Confirmed">Confirmed</option><option value="Cancelled">Cancelled</option></select></label>
              {error && <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
              <div className="flex justify-end gap-2 pt-2 sm:col-span-2"><button type="button" onClick={closeEditor} disabled={saving} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div>
            </form>
          </section>
        </div>
      )}

      {deletingBooking && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-booking-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="delete-booking-title" className="text-lg font-black">Delete this booking?</h3>
            <p className="mt-2 text-sm text-slate-600">Booking {deletingBooking.id} for {deletingBooking.customerName} will be permanently removed.</p>
            {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-2"><button onClick={() => setDeletingBooking(null)} disabled={saving} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button><button onClick={() => void deleteBooking()} disabled={saving} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Deleting..." : "Delete booking"}</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
