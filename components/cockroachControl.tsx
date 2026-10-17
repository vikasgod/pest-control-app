"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
  return (
    <main>
      <section className="bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
        <Link href="/search">
          <Image
            src="/services/Cockroach-Banner.png"
            width={1550}
            height={350}
            alt="cockroach"
          />
        </Link>
      </section>
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <h1 className="font-bold text-4xl mb-5">Cockroach Control Service</h1>
        <p className="text-xl mb-5">
          Keep your home and workplace clean, hygienic, and cockroach-free with
          our professional cockroach control service. Our trained technicians
          inspect affected areas and use suitable pest control treatments to
          help eliminate cockroaches and reduce the chances of future
          infestation. We provide cockroach control solutions for homes,
          offices, restaurants, shops, and other commercial spaces.
        </p>
        <h2 className="text-3xl font-semibold mt-5 mb-5">
          List of Cockroach Control Services
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 xl:grid-cols-2">
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
                        You save ₹
                        {(price - discountPrice).toLocaleString("en-IN")} on
                        this service
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        Standard service price
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-emerald-700 transition group-hover:text-emerald-900">
                      Service Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default CockroachControl;
