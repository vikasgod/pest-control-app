
"use client";

import { useState } from "react";

type Service = {
  id: string;
  name: string;
  serviceType: string;
  propertyType: string;
  price: number;
  discountPrice?: number;
};

type Category = {
  id: string;
  name: string;
  services: Service[];
};

export default function ServiceSearch({
  onResults,
}: {
  onResults: (categories: Category[] | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);

    if (!value.trim()) {
      onResults(null);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/services/search?q=${encodeURIComponent(value)}`
      );

      const result = await response.json();

      onResults(
        response.ok && result.success ? result.data : []
      );
    } catch (error) {
      console.error("Search failed:", error);
      onResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => void handleSearch(e.target.value)}
        placeholder="Search category or service..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-600"
      />
      <button
        type="button"
        onClick={() => {
          setQuery("");
          onResults(null);
        }}
        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
      >
        Reset
      </button>

      {loading && (
        <span className="text-xs text-slate-500">
          Searching...
        </span>
      )}
    </div>
  );
}
