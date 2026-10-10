import { Suspense } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import AvailabilitySearch from "../../components/AvailabilitySearch";

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="grid min-h-[60vh] place-items-center">Loading availability search...</main>}>
        <AvailabilitySearch />
      </Suspense>
      <Footer />
    </>
  );
}
