import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Search,
  Droplets,
  ShieldCheck,
  Leaf,
  CalendarCheck,
} from "lucide-react";
import CockroachControl from "../../../components/cockroachControl";

function Page() {
  const data = [
    {
      step: "01",
      title: "Inspection and Assessment",
      description:
        "The technician inspects the property for ant trails, entry points, food sources, moisture, and signs of nesting around kitchens, bathrooms, windows, and outdoor areas.",
      icon: Search,
    },
    {
      step: "02",
      title: "Nest and Entry Point Identification",
      description:
        "Common entry routes and potential nesting areas are identified. The technician assesses the ant species and activity to help select an appropriate control method.",
      icon: Droplets,
    },
    {
      step: "03",
      title: "Ant Treatment",
      description:
        "Depending on the ant species and infestation, suitable methods may include ant bait stations, targeted gel baits, or approved treatments applied to appropriate areas.",
      icon: ShieldCheck,
    },
    {
      step: "04",
      title: "Prevention and Sanitation",
      description:
        "The technician recommends storing food in sealed containers, cleaning crumbs and spills, fixing leaks, removing accessible food sources, and sealing suitable gaps where ants enter.",
      icon: Leaf,
    },
    {
      step: "05",
      title: "Follow-up and Monitoring",
      description:
        "When included in the service plan, follow-up inspections help assess ant activity, check bait performance, and determine whether additional treatment or preventive measures are needed.",
      icon: CalendarCheck,
    },
  ];
  return (
    <main>
      <section className="bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
        <Link href="/search">
          <Image
            src="/services/Cockroach-Banner.png"
            width={1550}
            height={350}
            alt="ant-control"
          />
        </Link>
      </section>
      <section className="mx-auto max-w-[1180px] px-4 py-10">
        <h1 className="font-bold text-4xl mb-5">Ant Control Service</h1>
        <p className="text-xl mb-5">
          Ant control is a professional pest management service designed to
          identify, control, and help prevent ant infestations in residential
          and commercial properties. Ants commonly enter buildings in search of
          food, water, and shelter. They may form trails around kitchens,
          pantries, bathrooms, gardens, and other areas where food crumbs or
          moisture are present.
          <br />
          <br />
          Our ant control solutions focus on identifying ant trails and nesting
          sites, addressing conditions that attract ants, and applying suitable
          treatments to help control the infestation and reduce the likelihood
          of recurring ant activity.
        </p>
      </section>
      <section className="bg-slate-50 px-3 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Our Process
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How Ant Control <span className="text-emerald-700">Works</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              From identifying breeding sites to targeted treatment, our process
              helps reduce ant activity and supports a more comfortable
              environment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.step}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 sm:p-7"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <div className="relative mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Step {Number(item.step)}
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 h-1 w-12 rounded-full bg-emerald-500 transition-all duration-300 group-hover:w-20" />
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <h2 className="mt-2 mb-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          List of Ant Control Services
        </h2>
        <CockroachControl />
      </section>
    </main>
  );
}

export default Page;
