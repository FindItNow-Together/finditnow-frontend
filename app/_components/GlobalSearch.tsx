"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import useDebounce from "@/hooks/useDebounce";
import { Shop } from "@/types/shop";

interface GlobalSearchResult {
  shops: Shop[];
  products: ProductResult[];
  totalShops: number;
  totalProducts: number;
}

interface ProductResult {
  product: {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    category?: {
      id: number;
      name: string;
    };
  };
  shop: Shop;
  inventory: {
    id: number;
    price: number;
    stock: number;
  };
  fulfillmentMode: string;
  distanceInKm?: number;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { query: debQuery, setDebounceQuery } = useDebounce(query);
  const api = useApi();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debQuery.trim().length > 2) {
      fetchResults();
    } else {
      setResults(null);
      setIsOpen(false);
    }
  }, [debQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: debQuery });
      const res = await api.get(`/api/search/global?${params.toString()}`, { auth: "public" });

      if (res.ok) {
        const body = await res.json();
        setResults(body?.data);
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Search error:", err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = (shopId: number) => {
    router.push(`/shop/${shopId}`);
    setIsOpen(false);
    setQuery("");
    setDebounceQuery("");
  };

  const handleProductClick = (shopId: number) => {
    router.push(`/shop/${shopId}`);
    setIsOpen(false);
    setQuery("");
    setDebounceQuery("");
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Search shops, products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDebounceQuery(e.target.value);
          }}
          onFocus={() => {
            if (results && (results.shops.length > 0 || results.products.length > 0)) {
              setIsOpen(true);
            }
          }}
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </span>
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ⏳
          </span>
        )}
      </div>

      {isOpen && results && (results.shops.length > 0 || results.products.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Shops Section */}
          {results.shops.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Shops {results.totalShops > results.shops.length && `(${results.totalShops} total)`}
              </h3>
              <div className="space-y-2">
                {results.shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => handleShopClick(shop.id)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                  >
                    <div className="font-medium text-gray-900">{shop.name}</div>
                    <div className="text-sm text-gray-500">{shop.address}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {results.products.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Products{" "}
                {results.totalProducts > results.products.length &&
                  `(${results.totalProducts} total)`}
              </h3>
              <div className="space-y-2">
                {results.products.map((item) => (
                  <button
                    key={`${item.shop.id}-${item.product.id}`}
                    onClick={() => handleProductClick(item.shop.id)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                  >
                    <div className="font-medium text-gray-900">{item.product.name}</div>
                    <div className="text-sm text-gray-500">
                      at {item.shop.name} • ${item.inventory.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isOpen &&
        results &&
        results.shops.length === 0 &&
        results.products.length === 0 &&
        !loading && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="text-center text-gray-500">
              No results found for &quot;{debQuery}&quot;
            </div>
          </div>
        )}
    </div>
  );
}
