"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts, type BlogPost } from "../app/blog/posts";
import { fetchBlogPosts } from "../app/blog/client";

export default function BlogListing() {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogPosts()
      .then((databasePosts) => {
        const databaseSlugs = new Set(databasePosts.map((post) => post.slug));
        setPosts([...databasePosts, ...blogPosts.filter((post) => !databaseSlugs.has(post.slug))]);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load blog posts.");
      });
  }, []);

  return (
    <main>
      <section className="bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:py-28">
          <p className="font-black uppercase tracking-widest text-emerald-700">Pestora Journal</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Helpful guides for a healthier home.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Straightforward advice to help you prevent pests and care for your home.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-44">
                <Image src={post.image} alt={post.title} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-700">{post.category}</span>
                <h2 className="mt-3 text-xl font-black">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-slate-500"><span>{post.publishedAt}</span><span>{post.readTime}</span></div>
                <Link className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-700" href={`/blog/${post.slug}`}>Read article <ArrowRight size={15} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
