"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth-client";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

const titles: Record<AuthMode, string> = {
  login: "Welcome back",
  register: "Create your account",
  "forgot-password": "Forgot your password?",
  "reset-password": "Set a new password",
};

export default function AuthForm({
  mode,
  resetToken = "",
  googleEnabled = false,
}: {
  mode: AuthMode;
  resetToken?: string;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "register") {
        const name = String(form.get("name") ?? "").trim();
        const username = String(form.get("username") ?? "").trim();
        const result = await authClient.signUp.email({
          name,
          email,
          password,
          username,
          callbackURL: "/crm",
        });
        if (result.error) throw new Error(result.error.message ?? "Unable to register.");
        router.push("/crm");
        router.refresh();
      } else if (mode === "login") {
        const username = String(form.get("username") ?? "").trim();
        const result = await authClient.signIn.username({
          username,
          password,
          callbackURL: "/crm",
        });
        if (result.error) throw new Error(result.error.message ?? "Email or password is incorrect.");
        router.push("/crm");
        router.refresh();
      } else if (mode === "forgot-password") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) throw new Error(result.error.message ?? "Unable to request a password reset.");
        setMessage("If an account exists for that email, password reset instructions have been sent.");
      } else {
        const newPassword = String(form.get("newPassword") ?? "");
        const confirmPassword = String(form.get("confirmPassword") ?? "");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
        if (!resetToken) throw new Error("Password reset link is missing or invalid.");
        const result = await authClient.resetPassword({ newPassword, token: resetToken });
        if (result.error) throw new Error(result.error.message ?? "Unable to reset password.");
        setMessage("Your password has been changed. You can now sign in.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/crm",
      });
      if (result.error) setError(result.error.message ?? "Unable to start Google sign-in.");
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to start Google sign-in.");
    }
  }

  const needsEmail = mode === "register" || mode === "forgot-password";
  const needsPassword = mode === "login" || mode === "register";

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)] p-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl md:p-9">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-emerald-800">
          <ShieldCheck size={23} />Pestora
        </Link>
        <h1 className="mt-7 text-3xl font-black">{titles[mode]}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "register" ? "Sign up to view your Pestora profile and services." : "Securely access your Pestora account."}
        </p>
        {(mode === "login" || mode === "register") && googleEnabled && (
          <>
            <button type="button" onClick={signInWithGoogle} className="mt-7 w-full rounded-xl border px-4 py-3 font-bold hover:bg-slate-50">
              Continue with Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div>
          </>
        )}
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && <Field label="Full name" name="name" autoComplete="name" required />}
          {(mode === "login" || mode === "register") && (
            <Field
              label="Username"
              name="username"
              autoComplete="username"
              minLength={3}
              maxLength={30}
              required
            />
          )}
          {needsEmail && <Field label="Email address" name="email" type="email" autoComplete="email" required />}
          {needsPassword && <Field label="Password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />}
          {mode === "reset-password" && (
            <>
              <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
              <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
            </>
          )}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
          <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
            {isSubmitting && <LoaderCircle className="animate-spin" size={17} />}
            {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : mode === "forgot-password" ? "Send reset link" : "Reset password"}
          </button>
        </form>
        <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
          {mode === "login" && <><Link className="text-emerald-800 hover:underline" href="/forgot-password">Forgot password?</Link><Link className="font-semibold text-emerald-800 hover:underline" href="/register">Create an account</Link></>}
          {mode === "register" && <Link className="font-semibold text-emerald-800 hover:underline" href="/login">Already registered? Sign in</Link>}
          {(mode === "forgot-password" || mode === "reset-password") && <Link className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline" href="/login"><ArrowLeft size={15} />Back to sign in</Link>}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  minLength,
  maxLength,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">{label}
      <input name={name} type={type} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} required={required} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-emerald-600" />
    </label>
  );
}
