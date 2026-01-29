"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PagedResponse, Shop } from "@/types/shop";
import { InventoryItem } from "@/types/inventory";
import ShopCard from "@/components/ShopCard";
import useApi from "@/hooks/useApi";

export default function DashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsWithInventory, setShopsWithInventory] = useState<Map<number, InventoryItem[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const { inventoryApi, shopApi } = useApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const response = (await shopApi.getMyShops()) as PagedResponse<Shop> | Shop[];
      // Handle paginated response
      const shopsList = Array.isArray(response)
        ? response
        : (response as PagedResponse<Shop>).content || [];
      setShops(shopsList);

      // Load inventory for each shop
      const inventoryMap = new Map<number, InventoryItem[]>();
      await Promise.all(
        shops.map(async (shop) => {
          try {
            const inventory = (await inventoryApi.getShopInventory(shop.id)) as InventoryItem[];
            inventoryMap.set(shop.id, inventory);
          } catch (err) {
            console.error(`Failed to load inventory for shop ${shop.id}`, err);
            inventoryMap.set(shop.id, []);
          }
        })
      );

      setShopsWithInventory(inventoryMap);
    } catch (err: any) {
      setError("Failed to load shops");
      console.error("Error loading shops:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops based on search query
  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) {
      return shops;
    }

    const query = searchQuery.toLowerCase();
    return shops.filter((shop) => {
      // Search in shop name, address, and phone
      const matchesShop =
        shop.name.toLowerCase().includes(query) ||
        shop.address.toLowerCase().includes(query) ||
        shop.phone.toLowerCase().includes(query);

      // Search in product names from inventory
      const inventory = shopsWithInventory.get(shop.id) || [];
      const matchesProducts = inventory.some((item) =>
        item.product.name.toLowerCase().includes(query)
      );

      return matchesShop || matchesProducts;
    });
  }, [shops, searchQuery, shopsWithInventory]);

  if (loading) {
    return <div className="container">Loading shops...</div>;
  }

  if (shops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Main Content (Empty State) */}
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Decorative Icon/Graphic */}
            <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
              <span className="text-4xl">🏪</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">No shops found</h1>
            <p className="text-gray-600 mb-8">
              Your system currently has no registered shops. Get started by creating your first
              storefront to manage products and inventory.
            </p>

            <button
              onClick={() => router.push("/register-shop")}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow-md"
            >
              <span className="mr-2 text-xl">+</span>
              Add Your First Shop
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => router.push("/register-shop")}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + Add New Shop
        </button>

        <button
          onClick={() => router.push("/delete-shops")}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
        >
          Remove Shop
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search shops by name, address, phone, or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
          w-full rounded-lg border-2 border-gray-300
          px-4 py-3 pr-10 text-base
          focus:outline-none focus:border-blue-500
          transition
        "
          />

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"}
          </p>
        )}
      </div>

      {/* Shop Cards Grid */}
      {filteredShops.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600">
          No shops found matching &quot; {searchQuery} &quot;
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {filteredShops.map((shop) => {
            const products = shopsWithInventory.get(shop.id) || [];

            return <ShopCard key={shop.id} shop={shop} productCount={products.length} />;
          })}
        </div>
      )}
    </div>
  );
}
