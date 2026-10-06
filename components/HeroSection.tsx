import BookingCard from "./bookingCard";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
      <div className="mx-auto w-full max-w-[1180px] px-6 grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-bold text-emerald-700">
            <ShieldCheck size={17} /> Professional & eco-conscious pest care
          </span>
          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
            A pest-free home{" "}
            <span className="bg-gradient-to-r from-[#087f5b] to-[#31a875] bg-clip-text text-transparent">starts here.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Modern pest control for modern homes. Verified technicians,
            transparent pricing and treatment plans designed around your
            family, pets and routine.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#booking"
              className="rounded-xl bg-emerald-700 px-6 py-4 font-bold text-white"
            >
              Book Treatment{" "}
              <ArrowRight className="ml-2 inline" size={17} />
            </a>
            <a
              href="#how"
              className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold"
            >
              See how it works
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-7 text-sm">
            <span>
              <b className="block text-xl">10K+</b> homes protected
            </span>
            <span>
              <b className="block text-xl">4.9/5</b> customer rating
            </span>
            <span>
              <b className="block text-xl">30-day</b> service warranty
            </span>
          </div>
        </div>
        <BookingCard />
      </div>
    </section>
  );
}
