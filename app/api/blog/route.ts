import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { blogPosts } from "../../blog/posts";
import { connectToDatabase } from "../../../lib/mongodb";
import BlogPostModel from "../../../models/BlogPost";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const slug = new URL(request.url).searchParams.get("slug");
    const posts = await BlogPostModel.find(slug ? { slug } : {})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      posts: posts.map(({ _id, __v, createdAt, updatedAt, ...post }) => post),
    });
  } catch (error) {
    console.error("Failed to load blog posts from MongoDB:", error);
    return errorResponse("Unable to load blog posts.", 500);
  }
}

export async function POST(request: Request) {
  const { auth } = await import("../../../lib/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return errorResponse("Admin authorization required.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error("Failed to read blog submission:", error);
    return errorResponse("Invalid form submission.", 400);
  }

  const title = form.get("title");
  const slug = form.get("slug");
  const category = form.get("category");
  const excerpt = form.get("excerpt");
  const heading = form.get("heading");
  const content = form.get("content");
  const image = form.get("image");

  if (
    typeof title !== "string" ||
    typeof slug !== "string" ||
    typeof category !== "string" ||
    typeof excerpt !== "string" ||
    typeof heading !== "string" ||
    typeof content !== "string" ||
    !(image instanceof File)
  ) {
    return errorResponse("All blog fields and a cover image are required.", 400);
  }

  if (!title.trim() || !slug.trim() || !category.trim() || !heading.trim() || !content.trim()) {
    return errorResponse("Blog fields cannot be empty.", 400);
  }
  const expectedSlug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug !== expectedSlug) {
    return errorResponse("The blog URL is invalid. Please check the post title.", 400);
  }
  if (excerpt.trim().length > 260) {
    return errorResponse("The summary must be 260 characters or fewer.", 400);
  }
  if (image.size <= 0 || image.size > MAX_IMAGE_SIZE || !allowedImageTypes.has(image.type)) {
    return errorResponse("Choose a JPG, PNG, WEBP, or GIF image smaller than 5 MB.", 400);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret || !process.env.MONGODB_URI) {
    return errorResponse("MongoDB or Cloudinary is not configured on the server.", 503);
  }

  try {
    await connectToDatabase();
    const existingPost = await BlogPostModel.exists({ slug });
    if (existingPost || blogPosts.some((post) => post.slug === slug)) {
      return errorResponse("A blog post with this title already exists.", 409);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "pestora/blog";
    const signaturePayload = `folder=${folder}&overwrite=false&public_id=${slug}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(signaturePayload).digest("hex");
    const cloudinaryForm = new FormData();
    cloudinaryForm.set("file", image, image.name);
    cloudinaryForm.set("api_key", apiKey);
    cloudinaryForm.set("timestamp", String(timestamp));
    cloudinaryForm.set("folder", folder);
    cloudinaryForm.set("public_id", slug);
    cloudinaryForm.set("overwrite", "false");
    cloudinaryForm.set("signature", signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: "POST", body: cloudinaryForm },
    );
    const uploadResult: unknown = await uploadResponse.json();
    if (!uploadResponse.ok || typeof uploadResult !== "object" || uploadResult === null || !("secure_url" in uploadResult) || typeof uploadResult.secure_url !== "string") {
      console.error("Cloudinary image upload failed:", uploadResult);
      return errorResponse("Image upload to Cloudinary failed.", 502);
    }

    const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
    const newPost = await BlogPostModel.create({
      slug,
      image: uploadResult.secure_url,
      title: title.trim(),
      category: category.trim(),
      excerpt: excerpt.trim(),
      publishedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      readTime: `${Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))} min read`,
      sections: [{ heading: heading.trim(), paragraphs }],
    });

    return NextResponse.json(
      {
        post: {
          slug: newPost.slug,
          image: newPost.image,
          title: newPost.title,
          category: newPost.category,
          excerpt: newPost.excerpt,
          publishedAt: newPost.publishedAt,
          readTime: newPost.readTime,
          sections: newPost.sections,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return errorResponse("A blog post with this title already exists.", 409);
    }
    console.error("Failed to save blog post:", error);
    return errorResponse("Unable to save blog post.", 500);
  }
}
