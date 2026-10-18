import React from "react";
import Image from "next/image";
import Link from "next/link";
import CockroachControl from "../../../components/cockroachControl";
import {
  Search,
  ClipboardCheck,
  ShieldCheck,
  House,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

function Page() {
  const termiteSteps = [
    {
      step: "01",
      title: "Inspection and Assessment",
      description:
        "The technician inspects the property for termite activity, mud tubes, damaged wood, moisture problems, and other signs of infestation.",
      icon: Search,
    },
    {
      step: "02",
      title: "Treatment Planning",
      description:
        "Based on the inspection, the technician recommends a suitable treatment method according to the infestation, property type, and affected areas.",
      icon: ClipboardCheck,
    },
    {
      step: "03",
      title: "Termite Treatment",
      description:
        "The selected treatment may involve targeted application, soil treatment, wood treatment, or bait systems, depending on the site and service offered.",
      icon: ShieldCheck,
    },
    {
      step: "04",
      title: "Property Protection",
      description:
        "Vulnerable areas are treated as appropriate to help control termite activity and reduce the likelihood of recurring infestation.",
      icon: House,
    },
    {
      step: "05",
      title: "Follow-up and Monitoring",
      description:
        "When required by the treatment plan, the technician conducts follow-up inspections to assess activity and determine whether additional treatment is needed.",
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
        <h1 className="font-bold text-4xl mb-5">Termite Control Service</h1>
        <p className="text-xl mb-5">
          Termite control is a professional pest management service designed to
          detect, prevent, and control termite infestations in residential and
          commercial properties. Termites can damage wooden furniture, doors,
          flooring, structural timber, and other cellulose-based materials.
          <br />
          <br />
          Our termite control solutions focus on identifying termite activity,
          selecting the appropriate treatment, and protecting vulnerable areas
          of the property to help reduce the risk of further damage.
        </p>
      </section>
      <section className="mx-auto max-w-[1180px] px-3 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Our Process
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How Termite Control{" "}
              <span className="text-emerald-700">Works</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              From the first inspection to follow-up monitoring, our process
              focuses on identifying termite activity and choosing the right
              treatment for your property.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {termiteSteps.map((item) => {
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
          List of termite Control Services
        </h2>
        <CockroachControl />
      </section>
    </main>
  );
}

export default Page;
