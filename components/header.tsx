'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Phone, ShieldCheck, X } from 'lucide-react';
import { authClient } from '../lib/auth-client';

export default function Header() {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [signOutError, setSignOutError] = useState('');
	const { data: session, isPending } = authClient.useSession();
	const navLinks = [
		['Services', '/#services'],
		['How It Works', '/#how'],
		['Why Us', '/#why'],
		['Reviews', '/#reviews'],
		['Blog', '/blog'],
	];

	async function signOut() {
		setSignOutError('');
		setIsSigningOut(true);
		try {
			const result = await authClient.signOut();
			if (result.error) {
				throw new Error(result.error.message ?? 'Unable to sign out.');
			}
			router.refresh();
		} catch (error) {
			setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.');
		} finally {
			setIsSigningOut(false);
		}
	}

	return (
		<header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
			<div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-2 px-4 py-3 sm:px-6">
				<Link href="/" className="flex items-center gap-3">
					<span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white sm:h-11 sm:w-11">
						<ShieldCheck size={21} />
					</span>
					<span>
						<b className="text-lg sm:text-xl">Pestquro</b>
						<small className="hidden text-[10px] font-bold uppercase tracking-widest text-emerald-700 sm:block">
							Safe Home · Healthy Life
						</small>
					</span>
				</Link>
				<nav className="hidden items-center gap-4 text-sm font-semibold lg:flex xl:gap-7">
					{navLinks.map(([label, href]) => (
						<Link key={label} href={href}>{label}</Link>
					))}
					{!isPending && (session ? (
						<button type="button" onClick={signOut} disabled={isSigningOut}>
							{isSigningOut ? 'Signing out...' : 'Sign out'}
						</button>
					) : (
						<Link href="/login">Sign in</Link>
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
						href="/search"
						className="rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 sm:px-5 sm:py-3 sm:text-sm"
					>
						<span className="sm:hidden">Book</span>
						<span className="hidden sm:inline">Book Service</span>
					</Link>
					{!isPending && (session ? (
						<button
							type="button"
							onClick={signOut}
							disabled={isSigningOut}
							className="hidden rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:inline-flex lg:hidden"
						>
							{isSigningOut ? 'Signing out...' : 'Sign out'}
						</button>
					) : null)}
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
						{!isPending && (session ? (
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false);
									void signOut();
								}}
								disabled={isSigningOut}
								className="rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-emerald-50 disabled:opacity-60"
							>
								{isSigningOut ? 'Signing out...' : 'Sign out'}
							</button>
						) : (
							<Link
								href="/login"
								onClick={() => setMenuOpen(false)}
								className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-emerald-50"
							>
								Sign in
							</Link>
						))}
					</div>
				</nav>
			)}
			{signOutError && (
				<p role="alert" className="mx-auto max-w-[1180px] px-4 pb-2 text-sm font-semibold text-red-700 sm:px-6">
					{signOutError}
				</p>
			)}
		</header>
	);
}
