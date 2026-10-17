import { Suspense } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import ServicesCatalog from "../../components/ServicesCatalog";

export default function ServicesPage() {
  return (
    <>
      <Suspense fallback={<main className="grid min-h-[60vh] place-items-center">Loading services...</main>}>
        <ServicesCatalog />
      </Suspense>
    </>
  );
}
