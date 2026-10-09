"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  WalletCards,
} from "lucide-react";

type CustomerStatus = "Active" | "VIP" | "At risk";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  service: string;
  status: CustomerStatus;
  lastVisit: string;
  totalSpent: number;
  nps: number;
  nextAction: string;
  tags: string[];
};

const customers: Customer[] = [
  {
    id: "CUST-2041",
    name: "Riya Kapoor",
    phone: "+91 98765 48932",
    email: "riya.kapoor@gmail.com",
    address: "Andheri West, Mumbai",
    service: "Cockroach Control",
    status: "Active",
    lastVisit: "6 days ago",
    totalSpent: 18500,
    nps: 92,
    nextAction: "Schedule quarterly spray",
    tags: ["Homeowner", "Repeat service", "Priority"],
  },
  {
    id: "CUST-2042",
    name: "Karan Mehta",
    phone: "+91 98210 72981",
    email: "karan.mehta@yahoo.com",
    address: "Powai, Mumbai",
    service: "Termite Inspection",
    status: "VIP",
    lastVisit: "2 days ago",
    totalSpent: 32450,
    nps: 96,
    nextAction: "Send treatment summary",
    tags: ["Commercial", "Premium plan", "High value"],
  },
  {
    id: "CUST-2043",
    name: "Sonia Nair",
    phone: "+91 98198 11460",
    email: "sonia.nair@outlook.com",
    address: "Bandra East, Mumbai",
    service: "Bed Bug Treatment",
    status: "At risk",
    lastVisit: "12 days ago",
    totalSpent: 12600,
    nps: 68,
    nextAction: "Follow-up to confirm satisfaction",
    tags: ["Needs attention", "Post-treatment check"],
  },
  {
    id: "CUST-2044",
    name: "Amit Shah",
    phone: "+91 97644 83120",
    email: "amit.shah@gmail.com",
    address: "Malad West, Mumbai",
    service: "Mosquito Control",
    status: "Active",
    lastVisit: "1 day ago",
    totalSpent: 9800,
    nps: 88,
    nextAction: "Plan seasonal maintenance",
    tags: ["Monsoon care", "Family plan"],
  },
];

const statusStyles: Record<CustomerStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  VIP: "bg-violet-50 text-violet-700 ring-violet-600/15",
  "At risk": "bg-amber-50 text-amber-700 ring-amber-600/15",
};

const serviceHistory = [
  { title: "Cockroach Control", date: "Apr 15, 2026", amount: "₹3,200", status: "Completed" },
  { title: "Follow-up inspection", date: "Mar 08, 2026", amount: "₹1,100", status: "Completed" },
  { title: "Mosquito treatment", date: "Feb 19, 2026", amount: "₹2,450", status: "Completed" },
];

const activityTimeline = [
  "Reviewed the latest service report with the technician team.",
  "Customer confirmed a recurring annual maintenance plan.",
  "Sent payment reminder after a 9-day follow-up gap.",
];

const summaryCards = [
  { label: "Bookings", value: "12", detail: "This year", icon: CalendarDays, color: "bg-emerald-50 text-emerald-700" },
  { label: "Avg. spend", value: "₹3,250", detail: "Per visit", icon: WalletCards, color: "bg-violet-50 text-violet-700" },
  { label: "NPS", value: "92", detail: "Customer score", icon: Star, color: "bg-amber-50 text-amber-700" },
  { label: "Retention", value: "94%", detail: "Repeat rate", icon: TrendingUp, color: "bg-sky-50 text-sky-700" },
] as const;

export default function CustomerManagement() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(customers[0].id);

  const filteredCustomers = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    if (!searchValue) return customers;

    return customers.filter((customer) => {
      const haystack = `${customer.name} ${customer.phone} ${customer.service} ${customer.address}`.toLowerCase();
      return haystack.includes(searchValue);
    });
  }, [query]);

  const selectedCustomer = filteredCustomers.find((customer) => customer.id === selectedId) ?? filteredCustomers[0] ?? customers[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Customer hub</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Customer management</h2>
          <p className="mt-1 text-sm text-slate-500">Track service history, relationship health, and follow-ups for every customer.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">
          <ShieldCheck size={17} /> Add customer
        </button>
      </div>

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
              const isSelected = customer.id === selectedCustomer.id;
              const initials = customer.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedId(customer.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${isSelected ? "border-emerald-200 bg-emerald-50 shadow-sm" : "border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white"}`}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-800">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-800">{customer.name}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyles[customer.status]}`}>
                        {customer.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{customer.service}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{customer.phone}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
                  {selectedCustomer.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-[#102a33]">{selectedCustomer.name}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${statusStyles[selectedCustomer.status]}`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Customer ID {selectedCustomer.id} • Last service {selectedCustomer.lastVisit}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Call</button>
                <button className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Schedule visit</button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map(({ label, value, detail, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={18} /></span>
                  </div>
                  <div className="mt-4 text-2xl font-black text-[#102a33]">{value}</div>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-black text-[#102a33]">Profile</h4>
                    <button className="text-sm font-bold text-emerald-700">Edit</button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow icon={Phone} label="Phone" value={selectedCustomer.phone} />
                    <InfoRow icon={Mail} label="Email" value={selectedCustomer.email} />
                    <InfoRow icon={MapPin} label="Address" value={selectedCustomer.address} />
                    <InfoRow icon={CheckCircle2} label="Service" value={selectedCustomer.service} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedCustomer.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-black text-[#102a33]">Service history</h4>
                    <button className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {serviceHistory.map((item) => (
                      <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div>
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#102a33]">{item.amount}</p>
                          <p className="mt-1 text-[11px] font-bold text-emerald-700">{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-[#102a33]">Payment summary</h4>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Paid</span>
                  </div>
                  <div className="mt-5">
                    <p className="text-sm text-slate-500">Total spent</p>
                    <p className="mt-2 text-3xl font-black text-[#102a33]">₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <span className="text-sm text-slate-500">Last invoice</span>
                      <span className="font-bold text-slate-800">₹5,200</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <span className="text-sm text-slate-500">Next billing</span>
                      <span className="font-bold text-slate-800">May 14</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-[#102a33]">Customer notes</h4>
                    <MessageSquareText size={18} className="text-emerald-700" />
                  </div>
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm font-bold text-emerald-800">Next action</p>
                    <p className="mt-2 text-sm text-slate-600">{selectedCustomer.nextAction}</p>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {activityTimeline.map((item) => (
                      <li key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                        <p className="text-sm text-slate-600">{item}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
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
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
