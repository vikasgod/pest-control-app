import { Suspense } from "react";
import AvailabilitySearch from "../../components/AvailabilitySearch";

export default function SearchPage() {
  return (
    <>
      <Suspense fallback={<main className="grid min-h-[60vh] place-items-center">Loading availability search...</main>}>
        <AvailabilitySearch />
      </Suspense>
    </>
  );
}
