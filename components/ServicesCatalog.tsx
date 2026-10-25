"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { serviceOptions, timeSlotOptions } from "../lib/technicians";

type CatalogService = {
  id: string;
  name: string;
  serviceType: string;
  propertyType: string;
  areaTypes: string[];
  durationMinutes: number;
  price: number;
  discountPrice?: number;
};

type ServiceCategory = {
  id: string;
  name: string;
  services: CatalogService[];
};

type BookingService = CatalogService & {
  categoryId: string;
  categoryName: string;
};

type BookingContext = {
  technicianId: string;
  technicianName: string;
  requestedService: string;
  pincode: string;
  date: string;
  timeSlot: string;
};

type BookingResponse = {
  booking?: { id: string; status: string };
  error?: string;
};

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ServicesCatalog() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [openSections, setOpenSections] = useState({
    property: true,
    area: false,
    service: false,
    serviceType: false,
  });
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [bookingService, setBookingService] = useState<BookingService | null>(
    null,
  );
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const params = new URLSearchParams(query);
  const bookingContext = useMemo<BookingContext>(() => {
    return {
      technicianId: params.get("technicianId") ?? "",
      technicianName: params.get("technicianName") ?? "",
      requestedService: params.get("service") ?? "",
      pincode: params.get("pincode") ?? "",
      date: params.get("date") ?? "",
      timeSlot: params.get("timeSlot") ?? "",
    };
  }, [query]);

  const hasBookingContext =
    Boolean(bookingContext.technicianId && bookingContext.technicianName) &&
    serviceOptions.some(
      (service) => service === bookingContext.requestedService,
    ) &&
    /^\d{6}$/.test(bookingContext.pincode) &&
    /^\d{4}-\d{2}-\d{2}$/.test(bookingContext.date) &&
    timeSlotOptions.some((slot) => slot === bookingContext.timeSlot);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    // Load the full catalog; search and filtering happen on the client.
    fetch("/api/services/search", {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "Unable to load services.");
        setCategories(result.data ?? []);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setLoadError(
          error instanceof Error ? error.message : "Unable to load services.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  function openBooking(category: ServiceCategory, service: CatalogService) {
    setBookingService({
      ...service,
      categoryId: category.id,
      categoryName: category.name,
    });
    setBookingForm({ customerName: "", phone: "", email: "", address: "" });
    setBookingError("");
    setBookingId("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingService || !hasBookingContext) return;

    setIsBooking(true);
    setBookingError("");
    try {
      const response = await fetch("/api/bookings", {        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingForm,
          categoryId: bookingService.categoryId,
          serviceId: bookingService.id,
          technicianId: bookingContext.technicianId,
          requestedService: bookingContext.requestedService,
          pincode: bookingContext.pincode,
          date: bookingContext.date,
          timeSlot: bookingContext.timeSlot,
        }),
      });
      const result: BookingResponse = await response.json();
      if (!response.ok || !result.booking) {
        throw new Error(result.error ?? "Unable to submit booking request.");
      }
      setBookingId(result.booking.id);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to submit booking request.",
      );
    } finally {
      setIsBooking(false);
    }
  }

  const propertyOptions = Array.from(
    new Set(categories.flatMap((category) =>
      (category.services ?? []).map((service) => service.propertyType).filter(Boolean),
    )),
  ).sort();

  const areaOptions = Array.from(
    new Set(categories.flatMap((category) =>
      (category.services ?? []).flatMap((service) => service.areaTypes ?? []),
    )),
  ).filter(Boolean).sort();

  const serviceOptionsList = Array.from(
    new Set(categories.map((category) => category.name).filter(Boolean)),
  ).sort();

  const serviceTypeOptions = Array.from(
    new Set(categories.flatMap((category) =>
      (category.services ?? []).map((service) => service.serviceType).filter(Boolean),
    )),
  ).sort();

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      services: (category.services ?? []).filter((service) => {
        const matchesProperty =
          selectedProperties.length === 0 || selectedProperties.includes(service.propertyType);
        const matchesArea =
          selectedAreas.length === 0 ||
          selectedAreas.some((area) => (service.areaTypes ?? []).includes(area));
        const matchesService =
          selectedServices.length === 0 || selectedServices.includes(category.name);
        const matchesServiceType =
          selectedServiceTypes.length === 0 || selectedServiceTypes.includes(service.serviceType);

        const searchableText = [
          category.name,
          service.name,
          service.propertyType,
          service.serviceType,
          ...(service.areaTypes ?? []),
        ].filter(Boolean).join(" ").toLowerCase();

        return (
          matchesProperty &&
          matchesArea &&
          matchesService &&
          matchesServiceType &&
          searchableText.includes(searchText.trim().toLowerCase())
        );
      }),
    }))
    .filter((category) => category.services.length > 0);

  const filteredServiceCount = filteredCategories.reduce(
    (total, category) => total + category.services.length,
    0,
  );

  const activeFilterCount =
    selectedProperties.length +
    selectedAreas.length +
    selectedServices.length +
    selectedServiceTypes.length;

  function toggleSection(section: keyof typeof openSections) {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  }

  function toggleFilter(
    value: string,
    selected: string[],
    setSelected: Dispatch<SetStateAction<string[]>>,
  ) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function clearAllFilters() {
    setSelectedProperties([]);
    setSelectedAreas([]);
    setSelectedServices([]);
    setSelectedServiceTypes([]);
    setSearchText("");
  }

  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#f5f8f7] px-4 py-10 text-[#102a33] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft size={17} /> Back to technician list
        </Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700">
              Service catalog
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Choose a service
            </h1>
            <p className="mt-2 text-slate-600">
              Browse service packages and transparent pricing.
            </p>
          </div>
          {hasBookingContext && (
            <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm">
              <p className="font-bold text-slate-900">
                Technician: {bookingContext.technicianName}
              </p>
              <p className="mt-1 text-slate-600">
                {bookingContext.date} · {bookingContext.timeSlot} ·{" "}
                {bookingContext.pincode}
              </p>
            </div>
          )}
        </div>

        {!hasBookingContext && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Choose an available technician from the search page to place a
            booking.
          </p>
        )}
        {loadError && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {loadError}
          </p>
        )}
        {isLoading && (
          <p role="status" className="mt-8 text-center text-sm text-slate-600">
            Loading saved services...
          </p>
        )}
        {!isLoading && !loadError && categories.length === 0 && (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            No active services have been added yet.
          </p>
        )}

        {!isLoading && !loadError && categories.length > 0 && (
          <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-700">Filter By</h2>
                <button type="button" onClick={clearAllFilters}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  Reset
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Advanced Filters</span>
                <span className="text-xs text-slate-500">{activeFilterCount} selected</span>
              </div>

              <div className="border-b border-slate-200 py-4 first:pt-0">
                <button type="button" onClick={() => toggleSection("property")}
                  aria-expanded={openSections.property}
                  className="flex w-full items-center justify-between gap-3 text-left text-lg text-slate-700">
                  <span>Property Type</span>
                  <span className="text-2xl leading-none text-slate-400">{openSections.property ? "−" : "+"}</span>
                </button>
                {openSections.property && (
                  <div className="mt-4 space-y-3">
                    {propertyOptions.length ? propertyOptions.map((property) => (
                      <label key={property} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                        <input type="checkbox" checked={selectedProperties.includes(property)}
                          onChange={() => toggleFilter(property, selectedProperties, setSelectedProperties)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700" />
                        <span>{property}</span>
                      </label>
                    )) : <p className="text-sm text-slate-400">No property types available.</p>}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-200 py-4">
                <button type="button" onClick={() => toggleSection("area")}
                  aria-expanded={openSections.area}
                  className="flex w-full items-center justify-between gap-3 text-left text-lg text-slate-700">
                  <span>Area</span>
                  <span className="text-2xl leading-none text-slate-400">{openSections.area ? "−" : "+"}</span>
                </button>
                {openSections.area && (
                  <div className="mt-4 space-y-3">
                    {areaOptions.length ? areaOptions.map((area) => (
                      <label key={area} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                        <input type="checkbox" checked={selectedAreas.includes(area)}
                          onChange={() => toggleFilter(area, selectedAreas, setSelectedAreas)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700" />
                        <span>{area}</span>
                      </label>
                    )) : <p className="text-sm text-slate-400">No areas available.</p>}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-200 py-4">
                <button type="button" onClick={() => toggleSection("service")}
                  aria-expanded={openSections.service}
                  className="flex w-full items-center justify-between gap-3 text-left text-lg text-slate-700">
                  <span>Service</span>
                  <span className="text-2xl leading-none text-slate-400">{openSections.service ? "−" : "+"}</span>
                </button>
                {openSections.service && (
                  <div className="mt-4 space-y-3">
                    {serviceOptionsList.length ? serviceOptionsList.map((service) => (
                      <label key={service} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                        <input type="checkbox" checked={selectedServices.includes(service)}
                          onChange={() => toggleFilter(service, selectedServices, setSelectedServices)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700" />
                        <span>{service}</span>
                      </label>
                    )) : <p className="text-sm text-slate-400">No services available.</p>}
                  </div>
                )}
              </div>

              <div className="py-4">
                <button type="button" onClick={() => toggleSection("serviceType")}
                  aria-expanded={openSections.serviceType}
                  className="flex w-full items-center justify-between gap-3 text-left text-lg text-slate-700">
                  <span>Service Type</span>
                  <span className="text-2xl leading-none text-slate-400">{openSections.serviceType ? "−" : "+"}</span>
                </button>
                {openSections.serviceType && (
                  <div className="mt-4 space-y-3">
                    {serviceTypeOptions.length ? serviceTypeOptions.map((type) => (
                      <label key={type} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                        <input type="checkbox" checked={selectedServiceTypes.includes(type)}
                          onChange={() => toggleFilter(type, selectedServiceTypes, setSelectedServiceTypes)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700" />
                        <span>{type}</span>
                      </label>
                    )) : <p className="text-sm text-slate-400">No service types available.</p>}
                  </div>
                )}
              </div>
            </aside>

            <section className="min-w-0">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Available Services</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {filteredServiceCount} {filteredServiceCount === 1 ? "service" : "services"} found
                  </p>
                </div>
                <input type="search" value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search services..." aria-label="Search services"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 sm:max-w-xs" />
              </div>

              {filteredCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <SlidersHorizontal size={32} className="mx-auto text-slate-400" />
                  <h3 className="mt-4 text-lg font-black text-slate-900">No matching services found</h3>
                  <p className="mt-2 text-sm text-slate-500">Try changing your filters or search for another service.</p>
                  <button type="button" onClick={clearAllFilters}
                    className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <section key={category.id} className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                        <ShieldCheck size={20} />
                      </span>
                      <h2 className="text-xl font-black">{category.name}</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.services.map((service) => {
                        const price = Number(service.price) || 0;
                        const discountPrice = service.discountPrice != null ? Number(service.discountPrice) : null;
                        const hasDiscount = discountPrice !== null && discountPrice >= 0 && price > 0 && discountPrice < price;
                        const discountPercentage = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
                        const displayPrice = discountPrice !== null && discountPrice >= 0 ? discountPrice : price;

                        return (
                          <article key={service.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex-1">
                              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{service.serviceType}</p>
                              <h3 className="mt-2 text-lg font-black">{service.name}</h3>
                              <p className="mt-1 text-sm text-slate-500">{service.propertyType} · {service.durationMinutes} minutes</p>
                              {(service.areaTypes ?? []).length > 0 && (
                                <p className="mt-3 text-sm leading-6 text-slate-600">Areas: {service.areaTypes.join(", ")}</p>
                              )}
                              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <Clock3 size={15} /> Approx. {service.durationMinutes} min
                              </p>
                            </div>
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {hasDiscount && <span className="text-sm text-slate-400 line-through">{formatPrice(price)}</span>}
                                <strong className="text-xl font-black text-emerald-700">{formatPrice(displayPrice)}</strong>
                                {hasDiscount && <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{discountPercentage}% OFF</span>}
                              </div>
                              <button type="button" disabled={!hasBookingContext}
                                onClick={() => openBooking(category, service)}
                                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                                Book Now
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </section>
          </div>
        )}
      </div>

      {bookingService && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onClick={() => !isBooking && setBookingService(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                  Booking request
                </p>
                <h2 id="booking-title" className="mt-1 text-xl font-black">
                  {bookingId ? "Request submitted" : bookingService.name}
                </h2>
              </div>
              {!isBooking && (
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  aria-label="Close booking form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              )}
            </header>

            {bookingId ? (
              <div className="p-6 sm:p-7">
                <p className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 size={20} /> Booking request sent successfully.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Request ID: <strong>{bookingId}</strong>. Our team will
                  contact you to confirm the service.
                </p>
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={submitBooking}
                className="max-h-[75vh] space-y-4 overflow-y-auto p-5 sm:p-7"
              >
                <div className="rounded-xl bg-emerald-50 p-4 text-sm">
                  <p className="font-bold">
                    {bookingService.categoryName} · {bookingService.name}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {bookingContext.technicianName} · {bookingContext.date} ·{" "}
                    {bookingContext.timeSlot}
                  </p>
                  <p className="mt-2 font-black text-emerald-800">
                    {formatPrice(
                      bookingService.discountPrice ?? bookingService.price,
                    )}
                  </p>
                </div>
                <label className="block text-sm font-bold text-slate-700">
                  Customer name
                  <input
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
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Mobile number
                    <input
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
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600"
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
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600"
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
                    required
                    className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-600"
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
                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {isBooking ? "Submitting..." : "Confirm Booking Request"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
