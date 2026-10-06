"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from "./footer";
import Header from "./header";
import type { BlogPost } from "../app/blog/posts";
import { fetchBlogPost } from "../app/blog/client";

export default function CustomBlogArticle({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogPost(slug)
      .then(setPost)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this post.");
      })
      .finally(() => setLoaded(true));
  }, [slug]);

  if (!loaded) return <main className="grid min-h-screen place-items-center">Loading article...</main>;
  if (!post) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-black">{error ? "Unable to load article" : "Article not found"}</h1>
          {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
          <Link href="/blog" className="mt-6 inline-flex items-center gap-2 font-bold text-emerald-700"><ArrowLeft size={17} />All guides</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <article>
          <header className="bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
            <div className="mx-auto max-w-[900px] px-6 py-16 md:py-24">
              <Link href="/blog" className="inline-flex items-center gap-2 font-bold text-emerald-700"><ArrowLeft size={17} />All guides</Link>
              <p className="mt-10 font-black uppercase tracking-widest text-emerald-700">{post.category}</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{post.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>
              <div className="mt-6 flex gap-4 text-sm text-slate-500"><time>{post.publishedAt}</time><span>{post.readTime}</span></div>
            </div>
          </header>
          <div className="mx-auto max-w-[760px] px-6 py-14">
            <div className="relative mb-12 h-56 overflow-hidden rounded-3xl md:h-80">
              <Image src={post.image} alt={post.title} fill unoptimized sizes="(max-width: 768px) 100vw, 760px" className="object-cover" priority />
            </div>
            <div className="space-y-10">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-black">{section.heading}</h2>
                  <div className="mt-4 space-y-4 leading-8 text-slate-600">
                    {section.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-14 rounded-2xl bg-emerald-50 p-6 md:p-8">
              <h2 className="text-2xl font-black">Need help with a pest problem?</h2>
              <p className="mt-2 leading-7 text-slate-600">Pestora can help you find the right treatment for your home.</p>
              <Link href="/#booking" className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-700">Book a treatment <ArrowRight size={16} /></Link>
            </div>
            <Link href="/blog" className="mt-10 inline-flex items-center gap-2 font-bold text-emerald-700"><ArrowLeft size={17} />Back to all guides</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
