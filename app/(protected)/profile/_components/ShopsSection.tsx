"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shop, PagedResponse } from "@/types/shop";
import useApi from "@/hooks/useApi";
import ShopCard from "@/components/ShopCard";

export function ShopsSection() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shopApi, inventoryApi } = useApi();
  const router = useRouter();

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const response = (await shopApi.getMyShops()) as PagedResponse<Shop> | Shop[];
      const shopsList = Array.isArray(response) ? response : (response as PagedResponse<Shop>).content || [];
      setShops(shopsList);
      setError(null);
    } catch (err: any) {
      setError("Failed to load shops");
      console.error("Error loading shops:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Shops</h2>
        </div>
        <div className="text-center py-8 text-gray-500">Loading shops...</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Shops</h2>
          <p className="text-sm text-gray-500 mt-1">{shops.length} shop{shops.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => router.push("/register-shop")}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          Add Shop
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {shops.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any shops yet.</p>
          <button
            onClick={() => router.push("/register-shop")}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl"
          >
            Register Your First Shop
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} productCount={0} />
          ))}
        </div>
      )}
    </section>
  );
}
