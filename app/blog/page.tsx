import type { Metadata } from "next";
import BlogListing from "../../components/blogListing";
import Footer from "../../components/footer";
import Header from "../../components/header";

export const metadata: Metadata = {
  title: "Pestora Journal | Pest prevention guides",
  description:
    "Practical pest prevention and home care guides from the Pestora team.",
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <BlogListing />
      <Footer />
    </>
  );
}
