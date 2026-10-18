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

const mosquitoSteps = [
  {
    step: "01",
    title: "Inspection and Assessment",
    description:
      "The technician inspects the property for mosquito activity, stagnant water, clogged drains, plant trays, water containers, and other potential breeding sites.",
    icon: Search,
  },
  {
    step: "02",
    title: "Breeding Source Identification",
    description:
      "Potential breeding areas are identified. Where possible, standing water is removed, containers are emptied or covered, and drainage issues are addressed.",
    icon: Droplets,
  },
  {
    step: "03",
    title: "Mosquito Treatment",
    description:
      "Based on the inspection, appropriate methods may include targeted larval control, adult mosquito treatment, or other approved control measures suitable for the site.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Preventive Measures",
    description:
      "The technician recommends practical steps such as removing standing water, maintaining drains, covering water storage containers, and keeping outdoor areas clean.",
    icon: Leaf,
  },
  {
    step: "05",
    title: "Follow-up and Monitoring",
    description:
      "When required, follow-up inspections assess mosquito activity and breeding sources to determine whether additional treatment or preventive action is needed.",
    icon: CalendarCheck,
  },
];
function Page() {
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
      <section className="mx-auto max-w-[1180px] px-4 py-10">
        <h1 className="font-bold text-4xl mb-5">Mosquito Control Service</h1>
        <p className="text-xl mb-5">
          Mosquito control is a professional pest management service designed to
          reduce mosquito populations and help prevent mosquito breeding in
          residential and commercial properties. Mosquitoes commonly breed in
          stagnant water and damp areas, creating discomfort and potentially
          spreading mosquito-borne diseases.
          <br />
          <br />
          Our mosquito control solutions focus on identifying breeding sites,
          eliminating standing water where possible, and applying suitable
          treatments to help control adult mosquitoes and larvae. The treatment
          plan is selected according to the property, mosquito activity, and
          surrounding environment.
        </p>
      </section>
      <section className="bg-slate-50 px-3 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Our Process
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How Mosquito Control{" "}
              <span className="text-emerald-700">Works</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              From identifying breeding sites to targeted treatment, our process
              helps reduce mosquito activity and supports a more comfortable
              environment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mosquitoSteps.map((item) => {
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
          List of Mosquito Control Services
        </h2>
        <CockroachControl    />
      </section>
    </main>
  );
}

export default Page;
