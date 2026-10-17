import React from "react";
import Link from "next/link";
import { Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#071f29] py-12 text-white">
      <div className="mx-auto w-full max-w-[1180px] px-6 grid gap-10 md:grid-cols-4">
        <div>
          <div className="text-2xl font-black">Pestquro</div>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Professional pest control with a better customer experience.
          </p>
          <div className="flex items-center gap-1 text-sm font-bold">
            <Phone size={15} /> +91 98765 43210
          </div>
          <small className="text-slate-500">24/7 Support</small>
        </div>
        <div>
          <b>Company</b>
          <div className="mt-4 space-y-2 text-sm text-white/60">
            <p>About</p>
            <p>How it works</p>
            <Link href="/blog">Blog</Link>
          </div>
        </div>
        <div>
          <b>Services</b>
          <div className="mt-4 space-y-2 text-sm text-white/60">
            <p>Cockroach</p>
            <p>Termite</p>
            <p>Bed Bugs</p>
          </div>
        </div>
        <div>
          <b>Business</b>
          <div className="mt-4 space-y-2 text-sm text-white/60">
            <a href="/crm">CRM Dashboard</a>
            <p>Partner with us</p>
            <p>Support</p>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1180px] px-6 mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
        © 2026 Pestquro. Built for a modern pest-control business.
      </div>
    </footer>
  );
}

export default Footer;
