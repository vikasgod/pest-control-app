"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isCRM = pathname.startsWith("/crm");

  return (
    <>
      {!isCRM && <Header />}

      {children}

      {!isCRM && <Footer />}
    </>
  );
}
