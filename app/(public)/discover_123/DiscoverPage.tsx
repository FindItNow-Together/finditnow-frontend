"use client";

import { useEffect, useState, useCallback } from "react";
import useApi from "@/hooks/useApi";
import useDebounce from "@/hooks/useDebounce";
import { MapLocation } from "@/types/mapLocation";

import { Opportunity } from "./types";
import { STATIC_OPPORTUNITIES } from "./staticOpportunities";

import ProductSearchBar from "./_components/ProductSearchBar";
import ProductList from "./_components/ProductList";
import DiscoverMap from "./_components/DiscoverMap";

export default function DiscoverClient() {
  const api = useApi();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const { query: debQuery, setDebounceQuery } = useDebounce(query);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [usingMock, setUsingMock] = useState(false);

  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debQuery) params.set("q", debQuery);
      if (category !== "all") params.set("category", category);
      if (userLoc) {
        params.set("lat", String(userLoc.lat));
        params.set("lng", String(userLoc.lng));
      }

      const res = await api.get(`/api/search/products?${params.toString()}`);
      if (!res.ok) throw new Error();

      const body = await res.json();
      if (!body.opportunities) throw new Error();

      setOpportunities(body.opportunities);
      setUsingMock(false);
    } catch {
      setOpportunities(STATIC_OPPORTUNITIES);
      setUsingMock(true);
    }
  }, [debQuery, category, userLoc]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  /* derive products */
  const products = Array.from(
    new Map(opportunities.map((o) => [o.product.id, o.product])).values()
  );

  /* derive map locations */
  const mapLocations: MapLocation<Opportunity>[] = opportunities.map((o) => ({
    id: `${o.shop.id}-${o.product.id}`,
    lat: o.shop.lat,
    lng: o.shop.lng,
    data: o,
  }));

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <header className="max-w-7xl mx-auto px-6 py-8">
        <ProductSearchBar
          value={query}
          onChange={(v) => {
            setQuery(v);
            setDebounceQuery(v);
          }}
          category={category}
          onCategoryChange={setCategory}
        />
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7">
          <ProductList products={products} opportunities={opportunities} />
        </section>

        <aside className="lg:col-span-5">
          <DiscoverMap locations={mapLocations} userLocation={userLoc} />
        </aside>
      </main>

      {usingMock && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
          Mock data
        </div>
      )}
    </div>
  );
}
