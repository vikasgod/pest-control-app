import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-[#071f29] py-12 text-white">
      <div className="mx-auto w-full max-w-[1180px] px-6 grid gap-10 md:grid-cols-4">
        <div>
          <div className="text-2xl font-black">Pestora</div>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Professional pest control with a better customer experience.
          </p>
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
        © 2026 Pestora. Built for a modern pest-control business.
      </div>
    </footer>
  );
}

export default Footer;
