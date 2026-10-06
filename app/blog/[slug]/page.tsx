import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import CustomBlogArticle from "../../../components/customBlogArticle";
import { blogPosts, getBlogPost } from "../posts";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Pestora Journal | Pest prevention guides" };
  }

  return {
    title: `${post.title} | Pestora Journal`,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return <CustomBlogArticle slug={slug} />;
  }

  return (
    <>
      <Header />
      <main>
        <article>
          <header className="bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
            <div className="mx-auto max-w-[900px] px-6 py-16 md:py-24">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-bold text-emerald-700"
              >
                <ArrowLeft size={17} /> All guides
              </Link>
              <p className="mt-10 font-black uppercase tracking-widest text-emerald-700">
                {post.category}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {post.excerpt}
              </p>
              <div className="mt-6 flex gap-4 text-sm text-slate-500">
                <time>{post.publishedAt}</time>
                <span>{post.readTime}</span>
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-[760px] px-6 py-14">
            <div className="relative mb-12 h-56 overflow-hidden rounded-3xl md:h-80">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 760px"
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-10">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-black">{section.heading}</h2>
                  <div className="mt-4 space-y-4 leading-8 text-slate-600">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.tips && (
                    <ul className="mt-5 list-disc space-y-2 pl-6 leading-7 text-slate-600 marker:text-emerald-700">
                      {section.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
            <div className="mt-14 rounded-2xl bg-emerald-50 p-6 md:p-8">
              <h2 className="text-2xl font-black">
                Need help with a pest problem?
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Pestora can help you find the right treatment for your home.
              </p>
              <Link
                href="/#booking"
                className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-700"
              >
                Book a treatment <ArrowRight size={16} />
              </Link>
            </div>
            <Link
              href="/blog"
              className="mt-10 inline-flex items-center gap-2 font-bold text-emerald-700"
            >
              <ArrowLeft size={17} /> Back to all guides
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
