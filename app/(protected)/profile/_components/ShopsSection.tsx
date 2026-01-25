"use client";

import useApi from "@/hooks/useApi";
import { Shop } from "@/types/shop";
import { useEffect, useState } from "react";
import ShopCard from "@/components/ShopCard";
import { useRouter } from "next/navigation";

export function ShopsSection() {
  const { shopApi } = useApi();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const res = await shopApi.getMyShops();
      setShops(res as unknown as Shop[]);
    } catch (error) {
      console.error("Failed to load shops", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this shop?")) return;
    try {
      await shopApi.delete(id);
      setShops((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert("Failed to delete shop");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Shops</h2>
        </div>
        <button
          onClick={() => router.push("/register-shop")}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          Add Shop
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading shops...</div>
      ) : shops.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          You haven't registered any shops yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {shops.map((shop) => (
            <div key={shop.id} className="relative">
              <ShopCard shop={shop} />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(shop.id);
                  }}
                  className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition"
                  title="Delete Shop"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
