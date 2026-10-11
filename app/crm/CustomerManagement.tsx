"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";

type Booking = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  categoryName: string;
  serviceName: string;
  price: number;
  technicianName: string;
  requestedService: string;
  pincode: string;
  date: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  service: string;
  status: "Active" | "Cancelled";
  bookings: Booking[];
  totalValue: number;
  lastBooking: Booking;
};

type BookingResponse = {
  bookings?: Booking[];
  error?: string;
};

const statusStyles: Record<Customer["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupBookings(bookings: Booking[]): Customer[] {
  const grouped = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const key = booking.email.trim().toLowerCase() || booking.phone.replace(/\D/g, "");
    const customerBookings = grouped.get(key) ?? [];
    customerBookings.push(booking);
    grouped.set(key, customerBookings);
  }

  return [...grouped.entries()].map(([key, customerBookings]) => {
    const sortedBookings = [...customerBookings].sort((left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
    const lastBooking = sortedBookings[0];
    return {
      id: key,
      name: lastBooking.customerName,
      phone: lastBooking.phone,
      email: lastBooking.email,
      address: lastBooking.address,
      pincode: lastBooking.pincode,
      service: lastBooking.serviceName,
      status: sortedBookings.some((booking) => booking.status !== "Cancelled") ? "Active" : "Cancelled",
      bookings: sortedBookings,
      totalValue: sortedBookings.reduce((total, booking) => total + booking.price, 0),
      lastBooking,
    };
  }).sort((left, right) =>
    new Date(right.lastBooking.createdAt).getTime() - new Date(left.lastBooking.createdAt).getTime(),
  );
}

export default function CustomerManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/bookings");
      const result: BookingResponse = await response.json();
      if (!response.ok || !result.bookings) {
        throw new Error(result.error ?? "Unable to load customer bookings.");
      }
      setBookings(result.bookings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load customer bookings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const customers = useMemo(() => groupBookings(bookings), [bookings]);
  const filteredCustomers = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    if (!searchValue) return customers;
    return customers.filter((customer) => {
      const haystack = `${customer.name} ${customer.phone} ${customer.email} ${customer.service} ${customer.address} ${customer.pincode}`.toLowerCase();
      return haystack.includes(searchValue);
    });
  }, [customers, query]);
  const selectedCustomer =
    filteredCustomers.find((customer) => customer.id === selectedId) ??
    filteredCustomers[0];

  useEffect(() => {
    if (selectedCustomer && selectedCustomer.id !== selectedId) {
      setSelectedId(selectedCustomer.id);
    }
  }, [selectedCustomer, selectedId]);

  const totalBookingValue = selectedCustomer?.totalValue ?? 0;
  const averageBookingValue = selectedCustomer && selectedCustomer.bookings.length > 0
    ? Math.round(totalBookingValue / selectedCustomer.bookings.length)
    : 0;
  const summaryCards = [
    { label: "Bookings", value: String(selectedCustomer?.bookings.length ?? 0), detail: "From service booking records", icon: CalendarDays, color: "bg-emerald-50 text-emerald-700" },
    { label: "Booking value", value: `₹${totalBookingValue.toLocaleString("en-IN")}`, detail: "Total value, not payment status", icon: WalletCards, color: "bg-violet-50 text-violet-700" },
    { label: "Average booking", value: `₹${averageBookingValue.toLocaleString("en-IN")}`, detail: "Per booking", icon: WalletCards, color: "bg-sky-50 text-sky-700" },
    { label: "Last booking", value: selectedCustomer ? formatDate(selectedCustomer.lastBooking.date) : "—", detail: selectedCustomer?.lastBooking.timeSlot ?? "No booking yet", icon: CheckCircle2, color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Customer hub</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Customer management</h2>
          <p className="mt-1 text-sm text-slate-500">Customer profiles and service history from saved service bookings.</p>
        </div>
        <button onClick={() => void loadBookings()} disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">
          <RefreshCw size={17} /> {isLoading ? "Refreshing..." : "Refresh customers"}
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="mt-4 space-y-3">
            {filteredCustomers.map((customer) => {
              const isSelected = customer.id === selectedCustomer?.id;
              const initials = customer.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedId(customer.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${isSelected ? "border-emerald-200 bg-emerald-50 shadow-sm" : "border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white"}`}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-800">{initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-800">{customer.name}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyles[customer.status]}`}>{customer.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{customer.service}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{customer.phone}</p>
                  </div>
                </button>
              );
            })}
            {!isLoading && filteredCustomers.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                {customers.length ? "No customers match your search." : "No customer service bookings yet."}
              </p>
            )}
            {isLoading && <p className="p-5 text-center text-sm text-slate-500">Loading customers...</p>}
          </div>
        </aside>

        {selectedCustomer ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
                    {selectedCustomer.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black text-[#102a33]">{selectedCustomer.name}</h3>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${statusStyles[selectedCustomer.status]}`}>{selectedCustomer.status}</span>
                    </div>
                    <p className="text-sm text-slate-500">Customer from {selectedCustomer.bookings.length} service booking{selectedCustomer.bookings.length === 1 ? "" : "s"} · Last booking {formatDate(selectedCustomer.lastBooking.date)}</p>
                  </div>
                </div>
                <a href={`tel:${selectedCustomer.phone}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                  <Phone size={15} /> Call customer
                </a>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(({ label, value, detail, icon: Icon, color }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={18} /></span>
                    </div>
                    <div className="mt-4 text-xl font-black text-[#102a33]">{value}</div>
                    <p className="mt-1 text-xs text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-black text-[#102a33]">Profile</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoRow icon={Phone} label="Phone" value={selectedCustomer.phone} />
                      <InfoRow icon={Mail} label="Email" value={selectedCustomer.email} />
                      <InfoRow icon={MapPin} label="Address" value={selectedCustomer.address} />
                      <InfoRow icon={CheckCircle2} label="Service" value={`${selectedCustomer.service} · ${selectedCustomer.pincode}`} />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-black text-[#102a33]">Service history</h4>
                      <span className="text-sm text-slate-500">{selectedCustomer.bookings.length} booking(s)</span>
                    </div>
                    <div className="space-y-3">
                      {selectedCustomer.bookings.map((booking) => (
                        <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div>
                            <p className="font-bold text-slate-800">{booking.serviceName}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(booking.date)} · {booking.timeSlot} · {booking.technicianName}</p>
                            <p className="mt-1 text-xs text-slate-500">Booking {booking.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-[#102a33]">₹{booking.price.toLocaleString("en-IN")}</p>
                            <p className={`mt-1 text-[11px] font-bold ${booking.status === "Cancelled" ? "text-rose-700" : booking.status === "Confirmed" ? "text-emerald-700" : "text-amber-700"}`}>{booking.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-[#102a33]">Booking value summary</h4>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">From bookings</span>
                    </div>
                    <div className="mt-5">
                      <p className="text-sm text-slate-500">Total booking value</p>
                      <p className="mt-2 text-3xl font-black text-[#102a33]">₹{selectedCustomer.totalValue.toLocaleString("en-IN")}</p>
                      <p className="mt-1 text-xs text-slate-500">Booking amounts; payment collection is not recorded here.</p>
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <span className="text-sm text-slate-500">Latest booking</span>
                        <span className="font-bold text-slate-800">{formatDate(selectedCustomer.lastBooking.date)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <span className="text-sm text-slate-500">Technician</span>
                        <span className="font-bold text-slate-800">{selectedCustomer.lastBooking.technicianName}</span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-[#102a33]">Latest booking details</h4>
                      <MessageSquareText size={18} className="text-emerald-700" />
                    </div>
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-sm font-bold text-emerald-800">{selectedCustomer.lastBooking.serviceName}</p>
                      <p className="mt-2 text-sm text-slate-600">{selectedCustomer.lastBooking.categoryName} · {selectedCustomer.lastBooking.status}</p>
                      <p className="mt-2 text-sm text-slate-600">{selectedCustomer.lastBooking.address} · {selectedCustomer.lastBooking.pincode}</p>
                    </div>
                    <ul className="mt-5 space-y-3">
                      <li className="flex gap-3 rounded-xl bg-slate-50 p-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                        <p className="text-sm text-slate-600">Scheduled {formatDate(selectedCustomer.lastBooking.date)} during {selectedCustomer.lastBooking.timeSlot}.</p>
                      </li>
                      <li className="flex gap-3 rounded-xl bg-slate-50 p-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                        <p className="text-sm text-slate-600">Assigned technician: {selectedCustomer.lastBooking.technicianName}.</p>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !isLoading && !error && (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Select a customer with a service booking to view their details.
            </div>
          )
        )}
      </div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
