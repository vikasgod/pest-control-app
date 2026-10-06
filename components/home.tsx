import {
  Bug,
  ShieldCheck,
  Clock3,
  Star,
  ArrowRight,
  Leaf,
  UserRoundCheck,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import BookingCard from "./bookingCard";
import { blogPosts } from "../app/blog/posts";
const services = [
  [
    "🪳",
    "Cockroach Control",
    "Fast treatment for kitchens, homes and offices.",
  ],
  ["🐜", "Termite Control", "Protect furniture and property from damage."],
  ["🦟", "Mosquito Control", "Reduce mosquitoes around your home and office."],
  ["🛏️", "Bed Bug Control", "Deep treatment for beds, sofas and rooms."],
  ["🐀", "Rodent Control", "Safe solutions for rats and mice."],
  ["🪰", "Fly Control", "Keep food areas clean and hygienic."],
  ["🕷️", "Spider Control", "Target webs and recurring infestations."],
  ["🐜", "Ant Control", "Long-lasting treatment for ant colonies."],
];
function HomeContent() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
        <div className="mx-auto w-full max-w-[1180px] px-6 grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-bold text-emerald-700">
              <ShieldCheck size={17} /> Professional & eco-conscious pest care
            </span>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
              A pest-free home{" "}
              <span className="bg-gradient-to-r from-[#087f5b] to-[#31a875] bg-clip-text text-transparent">
                starts here.
              </span>
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
                Book Treatment <ArrowRight className="ml-2 inline" size={17} />
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
      <section
        id="services"
        className="mx-auto w-full max-w-[1180px] px-6 py-20"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="font-black uppercase tracking-widest text-emerald-700">
              Our services
            </p>
            <h2 className="mt-2 text-4xl font-black">
              One place for every pest problem.
            </h2>
          </div>
          <span className="hidden text-sm text-slate-500 md:block">
            Home · Office · Retail · Restaurant
          </span>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(([icon, title, desc]) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-3xl">
                {icon}
              </div>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              <a
                href="#booking"
                className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-emerald-700"
              >
                Book service <ArrowRight size={15} />
              </a>
            </div>
          ))}
        </div>
      </section>
      <section id="why" className="bg-[#082d27] py-20 text-white">
        <div className="mx-auto w-full max-w-[1180px] px-6 grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-black uppercase tracking-widest text-emerald-300">
              Why Pestora
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              More than pest control.{" "}
              <span className="text-emerald-300">Peace of mind.</span>
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-white/70">
              We combine trained people, clear processes and responsible
              products to make every visit predictable and professional.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                ["Verified technicians", UserRoundCheck],
                ["Eco-conscious products", Leaf],
                ["Flexible booking", CalendarCheck],
                ["Service warranty", ShieldCheck],
              ].map(([t, I]) => {
                const Icon = I as any;
                return (
                  <div
                    key={t as string}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <Icon className="text-emerald-300" />
                    <b className="mt-3 block">{t as string}</b>
                    <span className="mt-1 block text-sm text-white/60">
                      Built into every service.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-emerald-500/30 to-white/5 p-2">
            <div className="rounded-[1.6rem] border border-white/10 bg-[#103f36] p-8">
              <div className="flex items-center justify-between">
                <span className="font-bold">Protection Score</span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  Excellent
                </span>
              </div>
              <div className="mt-8 text-7xl font-black">
                98<span className="text-2xl">%</span>
              </div>
              <p className="mt-2 text-white/60">
                Customer satisfaction across completed treatments.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Fast technician assignment",
                  "Clear treatment instructions",
                  "Post-service follow-up",
                ].map((x) => (
                  <div key={x} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-300" size={18} />
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="how" className="mx-auto w-full max-w-[1180px] px-6 py-20">
        <div className="text-center">
          <p className="font-black uppercase tracking-widest text-emerald-700">
            How it works
          </p>
          <h2 className="mt-2 text-4xl font-black">
            From problem to protected in 4 steps.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            ["01", "Tell us the problem", "Choose a pest and property type."],
            ["02", "Pick a slot", "Select a convenient date and time."],
            ["03", "Meet your technician", "Track an assigned professional."],
            ["04", "Enjoy the result", "Get treatment notes and warranty."],
          ].map(([n, t, d]) => (
            <div
              key={n}
              className="relative rounded-2xl border bg-white p-7 shadow-sm"
            >
              <span className="text-4xl font-black text-emerald-100">{n}</span>
              <h3 className="mt-4 text-xl font-black">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="reviews" className="bg-emerald-50 py-20">
        <div className="mx-auto w-full max-w-[1180px] px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-black uppercase tracking-widest text-emerald-700">
                Reviews
              </p>
              <h2 className="mt-2 text-4xl font-black">
                Real homes. Real results.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <Star fill="currentColor" />
              <b className="text-2xl text-slate-900">4.9/5</b>
              <span className="text-sm text-slate-500">10,000+ reviews</span>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [
                "Rohit Sharma",
                "“The technician arrived on time and explained everything clearly. Great experience.”",
              ],
              [
                "Priya Mehta",
                "“Booking was simple, price was clear and the treatment worked really well.”",
              ],
              [
                "Amit Verma",
                "“Professional team and excellent follow-up. I would definitely use Pestora again.”",
              ],
            ].map(([n, q]) => (
              <article key={n} className="rounded-2xl bg-white p-7 shadow-sm">
                <div className="flex gap-1 text-amber-500">★★★★★</div>
                <p className="mt-5 leading-7 text-slate-600">{q}</p>
                <b className="mt-6 block">{n}</b>
                <span className="text-sm text-slate-400">
                  Verified customer
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="blog" className="mx-auto w-full max-w-[1180px] px-6 py-20">
        <p className="font-black uppercase tracking-widest text-emerald-700">
          Pestora Journal
        </p>
        <h2 className="mt-2 text-4xl font-black">
          Helpful guides for a healthier home.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {blogPosts.slice(0, 3).map((post, i) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-2xl border bg-white"
            >
              <div className="relative h-44">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
                  Guide 0{i + 1}
                </span>
                <h3 className="mt-3 text-xl font-black">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {post.excerpt}
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-700"
                  href={`/blog/${post.slug}`}
                >
                  Read article <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-2 font-bold text-emerald-700"
        >
          View all guides <ArrowRight size={16} />
        </Link>
      </section> 
    </div>
  );
}

export default HomeContent;







































































































