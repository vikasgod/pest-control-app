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
  const mosquitoSteps = [
    {
      step: "01",
      title: "Inspection and Assessment",
      description:
        "The technician inspects the property for signs of rodents, including droppings, gnaw marks, nesting materials, damaged packaging, and unusual activity.",
      icon: Search,
    },
    {
      step: "02",
      title: "Entry Point Identification",
      description:
        "Potential entry points, gaps around pipes, wall openings, doors, and other access routes are identified to determine how rodents enter the property.",
      icon: Droplets,
    },
    {
      step: "03",
      title: "Rodent Treatment",
      description:
        "Based on the inspection, suitable control methods may include traps, secured bait stations, and other approved measures selected for the property and infestation level.",
      icon: ShieldCheck,
    },
    {
      step: "04",
      title: "Prevention and Proofing",
      description:
        "The technician recommends sealing suitable entry points, storing food securely, removing clutter, and managing waste to reduce access to food and shelter.",
      icon: Leaf,
    },
    {
      step: "05",
      title: "Follow-up and Monitoring",
      description:
        "Follow-up visits, where included in the service plan, help assess rodent activity, check traps or bait stations, and determine whether further control measures are needed.",
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
            alt="cockroach"
          />
        </Link>
      </section>
      <section className="mx-auto max-w-[1180px] px-4 py-10">
        <h1 className="font-bold text-4xl mb-5">Rodent Control Service</h1>
        <p className="text-xl mb-5">
          Rodent control is a professional pest management service designed to
          identify, control, and help prevent infestations of rats and mice in
          residential and commercial properties. Rodents can contaminate food,
          damage furniture and electrical wiring, spread harmful pathogens, and
          create unsanitary conditions.
          <br />
          <br />
          Our rodent control solutions focus on identifying rodent activity,
          locating entry points, removing food and shelter sources, and using
          appropriate control methods to manage infestations and reduce the risk
          of recurrence.
        </p>
      </section>
      <section className="bg-slate-50 px-3 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Our Process
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How Rodent Control <span className="text-emerald-700">Works</span>
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
        <CockroachControl />
      </section>
    </main>
  );
}

export default Page;
