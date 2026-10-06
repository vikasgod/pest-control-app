'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, Phone, ShieldCheck, X } from 'lucide-react';

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const navLinks = [
		['Services', '/#services'],
		['How It Works', '/#how'],
		['Why Us', '/#why'],
		['Reviews', '/#reviews'],
		['Blog', '/blog'],
		['CRM', '/crm'],
		['Sign in', '/login'],
	];

	return (
		<header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
			<div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-2 px-4 py-3 sm:px-6">
				<Link href="/" className="flex items-center gap-3">
					<span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white sm:h-11 sm:w-11">
						<ShieldCheck size={21} />
					</span>
					<span>
						<b className="text-lg sm:text-xl">Pestora</b>
						<small className="hidden text-[10px] font-bold uppercase tracking-widest text-emerald-700 sm:block">
							Safe Home · Healthy Life
						</small>
					</span>
				</Link>
				<nav className="hidden items-center gap-4 text-sm font-semibold lg:flex xl:gap-7">
					{navLinks.map(([label, href]) => (
						<Link key={label} href={href}>{label}</Link>
					))}
				</nav>
				<div className="flex items-center gap-3">
					<div className="hidden text-right xl:block">
						<div className="flex items-center gap-1 text-sm font-bold">
							<Phone size={15} /> +91 98765 43210
						</div>
						<small className="text-slate-500">24/7 Support</small>
					</div>
					<Link
						href="/#booking"
						className="rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 sm:px-5 sm:py-3 sm:text-sm"
					>
						<span className="sm:hidden">Book</span>
						<span className="hidden sm:inline">Book Service</span>
					</Link>
					<button
						type="button"
						className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 lg:hidden"
						aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
						aria-expanded={menuOpen}
						aria-controls="mobile-navigation"
						onClick={() => setMenuOpen((open) => !open)}
					>
						{menuOpen ? <X size={22} /> : <Menu size={22} />}
					</button>
				</div>
			</div>
			{menuOpen && (
				<nav id="mobile-navigation" className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
					<div className="mx-auto grid max-w-[1180px] gap-1">
						{navLinks.map(([label, href]) => (
							<Link
								key={label}
								href={href}
								onClick={() => setMenuOpen(false)}
								className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-emerald-50"
							>
								{label}
							</Link>
						))}
					</div>
				</nav>
			)}
		</header>
	);
}
