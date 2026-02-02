"use client";

import { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import useDebounce from "@/hooks/useDebounce";
import { useParams } from "next/navigation";
import ProductSearchBar from "@/app/(public)/discover/_components/ProductSearchBar";
import ProductList from "@/app/(public)/discover/_components/ProductList";
import { Opportunity } from "@/app/(public)/discover/types";

export default function ShopPage() {
  const { id } = useParams();
  const api = useApi();

  const [shop, setShop] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const { query: debQuery, setDebounceQuery } = useDebounce(query);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Shop Details
  useEffect(() => {
    if (!id) return;
    api.shopApi.getShop(Number(id)).then(setShop).catch(console.error);
  }, [id, api]);

  // Search in Shop
  const fetchOpportunities = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debQuery) params.set("q", String(debQuery));
      if (category !== "all") params.set("category", category);

      // Pass shopId to restrict search
      params.set("shopId", String(id));

      // Note: We might want location here too if distance is relevant within a shop (probably not as much, but API expects it for sorting?)
      // For now, let's omit location or use a default if needed.
      // Actually the backend calculates distance only if userLoc is provided.
      // But for "in-shop" search, maybe we just want to know availability.

      const res = await api.get(`/api/search/products?${params.toString()}`);
      if (!res.ok) throw new Error();

      const body = await res.json();
      const opportunities = body?.data?.content || [];
      setOpportunities(opportunities);
    } catch (e) {
      console.error(e);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [debQuery, category, id, api]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  /* derive products */
  const products = Array.from(
    new Map(opportunities.map((o) => [o.product.id, o.product])).values()
  );

  if (!shop) return <div className="p-8 text-center">Loading shop...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-6">
          {/* Shop Logo */}
          <div className="flex-shrink-0">
            {shop.imageUrl ? (
              <img
                src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + shop.imageUrl}
                alt={shop.name}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border border-gray-200 text-blue-600 font-bold text-2xl">
                {shop.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            <p className="text-slate-600">
              {shop.description} · {shop.address}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <ProductSearchBar
          value={query}
          onChange={(v) => {
            setQuery(v);
            setDebounceQuery(v);
          }}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading ? (
          <div className="text-center py-10 text-slate-500">Searching...</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                {debQuery
                  ? "No products found matching your search."
                  : "Search for products in this shop."}
              </div>
            ) : (
              <ProductList products={products} opportunities={opportunities} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
