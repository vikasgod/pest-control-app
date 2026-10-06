import type { BlogPost } from "./posts";

function isBlogPost(value: unknown): value is BlogPost {
  if (typeof value !== "object" || value === null) return false;
  const post = value as Record<string, unknown>;
  return (
    typeof post.slug === "string" &&
    typeof post.image === "string" &&
    typeof post.title === "string" &&
    typeof post.category === "string" &&
    typeof post.excerpt === "string" &&
    typeof post.publishedAt === "string" &&
    typeof post.readTime === "string" &&
    Array.isArray(post.sections) &&
    post.sections.every((section: unknown) => {
      if (typeof section !== "object" || section === null) return false;
      const articleSection = section as Record<string, unknown>;
      return (
        typeof articleSection.heading === "string" &&
        Array.isArray(articleSection.paragraphs) &&
        articleSection.paragraphs.every((paragraph: unknown) => typeof paragraph === "string")
      );
    })
  );
}

async function readPosts(response: Response): Promise<BlogPost[]> {
  const result: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Unable to load blog posts.";
    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("posts" in result) ||
    !Array.isArray(result.posts) ||
    !result.posts.every(isBlogPost)
  ) {
    throw new Error("The blog API returned an invalid response.");
  }
  return result.posts;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return readPosts(await fetch("/api/blog"));
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await readPosts(await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`));
  return posts[0] ?? null;
}
