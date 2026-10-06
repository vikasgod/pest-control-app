import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sectionSchema = new Schema(
  {
    heading: { type: String, required: true, trim: true },
    paragraphs: { type: [String], required: true },
    tips: { type: [String], default: undefined },
  },
  { _id: false },
);

const blogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 260 },
    publishedAt: { type: String, required: true },
    readTime: { type: String, required: true },
    sections: { type: [sectionSchema], required: true },
  },
  { timestamps: true },
);

export type StoredBlogPost = InferSchemaType<typeof blogPostSchema>;

const BlogPostModel =
  mongoose.models.BlogPost ??
  mongoose.model("BlogPost", blogPostSchema);

export default BlogPostModel;
