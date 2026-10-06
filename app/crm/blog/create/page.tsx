"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";
import { authClient } from "../../../../lib/auth-client";
import { type CrmRole } from "../../roles";

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreateBlogPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionRole = session
    ? (session.user as typeof session.user & { role?: string }).role
    : undefined;
  const role: CrmRole | null =
    sessionRole === "admin" || sessionRole === "agent" || sessionRole === "user"
      ? sessionRole
      : session
        ? "user"
        : null;

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (role !== "admin") {
      setError("Only admins can publish blog posts.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const slug = toSlug(title);

    if (!slug) {
      setError("Enter a title containing letters or numbers.");
      return;
    }

    formData.set("slug", slug);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to publish the blog post.";
        setError(message);
        return;
      }

      router.push(`/blog/${slug}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the blog post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPending) {
    return <main className="grid min-h-screen place-items-center">Loading...</main>;
  }

  if (!session || role !== "admin") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8f7] p-6">
        <section className="max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto text-amber-600" size={38} />
          <h1 className="mt-4 text-2xl font-black">Admin access required</h1>
          <p className="mt-2 text-slate-600">Only an admin can create and publish blog posts.</p>
          <Link href={session ? "/crm" : "/login"} className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">{session ? "Back to CRM" : "Sign in"}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8f7] px-5 py-8 text-[#102a33] md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/crm" className="inline-flex items-center gap-2 font-bold text-emerald-800"><ArrowLeft size={17} /> Back to CRM</Link>
        <header className="mt-7">
          <p className="font-black uppercase tracking-widest text-emerald-700">Pestora Journal</p>
          <h1 className="mt-2 text-4xl font-black">Create a blog post</h1>
          <p className="mt-2 text-slate-600">Add an article to the public Pestora blog. The cover image uploads to Cloudinary.</p>
        </header>
        <form onSubmit={submitPost} className="mt-8 space-y-6 rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <Field label="Post title" name="title" placeholder="e.g. How to prevent termites" required />
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Category" name="category" placeholder="Pest control tips" required />
            <label className="block text-sm font-bold">Cover image
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="mt-2 w-full rounded-xl border px-4 py-3 font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-bold file:text-emerald-800" />
              <span className="mt-1 block text-xs font-normal text-slate-500">JPG, PNG, WEBP, or GIF · max 5 MB</span>
            </label>
          </div>
          <label className="block text-sm font-bold">Short description
            <textarea name="excerpt" className="mt-2 min-h-24 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-emerald-600" maxLength={260} required />
          </label>
          <Field label="Section heading" name="heading" placeholder="What homeowners should know" required />
          <label className="block text-sm font-bold">Article content
            <textarea name="content" className="mt-2 min-h-64 w-full rounded-xl border px-4 py-3 font-normal leading-7 outline-none focus:border-emerald-600" placeholder="Write the article. Separate paragraphs with a blank line." required />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? "Uploading and publishing..." : "Publish post"}
          </button>
          <p className="text-xs leading-5 text-slate-500">The image URL and article details are stored in MongoDB after the Cloudinary upload succeeds.</p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">{label}
      <input name={name} placeholder={placeholder} required={required} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-emerald-600" />
    </label>
  );
}
