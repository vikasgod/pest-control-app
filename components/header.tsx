'use client';
import Link from 'next/link'; import {Phone,ShieldCheck,Menu} from 'lucide-react';
export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
			<div className="mx-auto flex h-18 w-full max-w-[1180px] items-center justify-between px-6 py-4">
				<Link href="/" className="flex items-center gap-3">
					<span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-700 text-white">
						<ShieldCheck />
					</span>
					<span>
						<b className="text-xl">Pestora</b>
						<small className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700">
							Safe Home · Healthy Life
						</small>
					</span>
				</Link>
				<nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
					<Link href="#services">Services</Link>
					<Link href="#how">How It Works</Link>
					<Link href="#why">Why Us</Link>
					<Link href="#reviews">Reviews</Link>
					<Link href="/blog">Blog</Link>
					<Link href="/crm">CRM</Link>
					<Link href="/login">Sign in</Link>
				</nav>
				<div className="flex items-center gap-3">
					<div className="hidden text-right lg:block">
						<div className="flex items-center gap-1 text-sm font-bold">
							<Phone size={15} /> +91 98765 43210
						</div>
						<small className="text-slate-500">24/7 Support</small>
					</div>
					<Link
						href="#booking"
						className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20"
					>
						Book Service
					</Link>
					<Menu className="md:hidden" />
				</div>
			</div>
		</header>
	);
}
