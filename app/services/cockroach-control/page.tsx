import React from "react";
import CockroachControl from "../../../components/cockroachControl";
import Image from "next/image";
import Link from "next/link";

function Page() {
  return (
    <main>
      <section className="bg-[radial-gradient(circle_at_75%_25%,#d8f7e8,transparent_35%),linear-gradient(120deg,#effaf5,#fff)]">
        <Link href="/search">
          <Image
            src="/services/Cockroach-Banner.png"
            width={1550}
            height={350}
            alt="cockroach"
          />
        </Link>
      </section>
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <h1 className="font-bold text-4xl mb-5">Cockroach Control Service</h1>
        <p className="text-xl mb-5">
          Keep your home and workplace clean, hygienic, and cockroach-free with
          our professional cockroach control service. Our trained technicians
          inspect affected areas and use suitable pest control treatments to
          help eliminate cockroaches and reduce the chances of future
          infestation. We provide cockroach control solutions for homes,
          offices, restaurants, shops, and other commercial spaces.
        </p>
        <h2 className="text-3xl font-semibold mt-5 mb-5">
          List of Cockroach Control Services
        </h2>
        <CockroachControl />
      </section>
    </main>
  );
}

export default Page;
