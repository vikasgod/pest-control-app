"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

interface ServiceData {
  name: string;
  serviceType: string;
  propertyType: string;
  areaTypes: string[];
  durationMinutes: number;
  price: number;
  description: string;
  isActive: boolean;
  discountPrice: number;
}
type Data = {
  discountPrice: number;
  name: string;
  price: number;
};

function CockroachControl() {
  const pathName = usePathname();
  const [service, setService] = useState<ServiceData[] | []>([]);
  const getCockroachControle = async () => {
    try {
      const query = pathName.split("/")[2];
      const response = await fetch(
        `/api/services/serviceListByName?name=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setService(data.services);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (pathName) {
      getCockroachControle();
    }
  }, [pathName]);
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [openBooking, setOpenBooking] = useState(false);
  const [bookingData, setBookingData] = useState<Data>();
  const [bookingError, setBookingError] = useState("");

  const openBookingForm = (item: any) => {
    console.log(item);
    setBookingData(item);
    setOpenBooking(true);
  };

  const submitBooking = () => {
    console.log("submit booking");
  };
  function formatPrice(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {service.map((item, i) => {
        const price = Number(item.price) || 0;
        const discountPrice =
          item.discountPrice != null ? Number(item.discountPrice) : null;

        const hasDiscount =
          discountPrice !== null &&
          discountPrice >= 0 &&
          price > 0 &&
          discountPrice < price;

        const finalPrice = hasDiscount ? discountPrice : price;

        const discountPercentage = hasDiscount
          ? Math.round(((price - discountPrice) / price) * 100)
          : 0;

        return (
          <div
            key={i + 1}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
          >
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-200" />

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {item.serviceType}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.isActive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-1 min-h-[50px]">
                <h3 className="text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-800">
                  {item.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Property Type</p>
                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                    {item.propertyType || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">
                    {item.durationMinutes ?? 0} mins
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Area Covered
                </p>

                <div className="flex flex-wrap gap-2">
                  {item.areaTypes?.length ? (
                    item.areaTypes.map((area, index) => (
                      <span
                        key={`${area}-${index}`}
                        className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
                      >
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      No area specified
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex min-h-6 items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Service Price
                  </span>

                  {hasDiscount && (
                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>

                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {hasDiscount ? (
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    You save ₹{(price - discountPrice).toLocaleString("en-IN")}{" "}
                    on this service
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Standard service price
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => openBookingForm(item)}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {openBooking && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-request-title"
            className="relative my-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2
                id="quote-request-title"
                className="text-xl font-bold text-slate-900"
              >
                Request a Booking
              </h2>

              <button
                type="button"
                onClick={() => setOpenBooking(false)}
                aria-label="Close quotation form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={submitBooking}
              className="max-h-[75vh] space-y-4 overflow-y-auto p-5 sm:p-8"
            >
              <div className="rounded-xl bg-emerald-50 p-4 text-sm">
                <p className="font-bold text-slate-900">{bookingData?.name}</p>

                <p className="mt-2 font-black text-emerald-800">
                  {formatPrice(
                    bookingData?.discountPrice ?? bookingData?.price,
                  )}
                </p>
              </div>

              <label className="block text-sm font-bold text-slate-700">
                Customer name
                <input
                  type="text"
                  value={bookingForm.customerName}
                  onChange={(event) =>
                    setBookingForm((current) => ({
                      ...current,
                      customerName: event.target.value,
                    }))
                  }
                  maxLength={100}
                  autoComplete="name"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-700">
                  Mobile number
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        phone: event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block text-sm font-bold text-slate-700">
                  Email
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <label className="block text-sm font-bold text-slate-700">
                Service address
                <textarea
                  value={bookingForm.address}
                  onChange={(event) =>
                    setBookingForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  maxLength={500}
                  autoComplete="street-address"
                  rows={3}
                  placeholder="Enter your complete service address"
                  required
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              {bookingError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"
                >
                  {bookingError}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpenBooking(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Confirm Booking
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default CockroachControl;
