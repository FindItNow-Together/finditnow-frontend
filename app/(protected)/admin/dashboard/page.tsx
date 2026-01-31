"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shop, PagedResponse } from "@/types/shop";
import { InventoryItem } from "@/types/inventory";
import ShopCard from "@/components/ShopCard";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";

export default function AdminDashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const { logout } = useAuth();
  const [shopsWithInventory, setShopsWithInventory] = useState<Map<number, InventoryItem[]>>(
    new Map()
  );
  const { inventoryApi, shopApi } = useApi();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadAllShops();
  }, []);

  const loadAllShops = async () => {
    try {
      const response = (await shopApi.getAllShops()) as PagedResponse<Shop> | Shop[];
      // Handle paginated response
      const shopsList = Array.isArray(response)
        ? response
        : (response as PagedResponse<Shop>).content || [];
      setShops(shopsList);

      const inventoryMap = new Map<number, InventoryItem[]>();
      await Promise.all(
        shopsList.map(async (shop) => {
          try {
            const inventory = (await inventoryApi.getShopInventory(shop.id)) as InventoryItem[];
            inventoryMap.set(shop.id, inventory);
          } catch {
            inventoryMap.set(shop.id, []);
          }
        })
      );

      setShopsWithInventory(inventoryMap);
    } catch (err) {
      setError("Failed to load shops");
      console.error("Error loading shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(() => router.replace("/login"));
  };

  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return shops;

    const query = searchQuery.toLowerCase();
    return shops.filter((shop) => {
      const matchesShop =
        shop.name.toLowerCase().includes(query) ||
        shop.address.toLowerCase().includes(query) ||
        shop.phone.toLowerCase().includes(query);

      const inventory = shopsWithInventory.get(shop.id) || [];
      const matchesProducts = inventory.some((item) =>
        item.product.name.toLowerCase().includes(query)
      );

      return matchesShop || matchesProducts;
    });
  }, [shops, searchQuery, shopsWithInventory]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-gray-600">Loading shops...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage all shops in the system</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-md border border-gray-300
                               text-gray-700 hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-2">{error}</div>}

      {/* Stats */}
      <div className="mb-6 rounded-lg bg-blue-50 border border-blue-100 p-6">
        <div className="flex flex-wrap justify-around gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{shops.length}</p>
            <p className="text-sm text-gray-600">Total Shops</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {Array.from(shopsWithInventory.values()).reduce((sum, inv) => sum + inv.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => router.push("/register-shop")}
          className="px-5 py-2 rounded-md bg-blue-600 text-white
                               hover:bg-blue-700 transition"
        >
          + Add New Shop
        </button>

        <button
          onClick={() => router.push("/admin/delete-shops")}
          className="px-5 py-2 rounded-md bg-red-600 text-white
                               hover:bg-red-700 transition"
        >
          Remove Shops
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search shops by name, address, phone, or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300
                                   px-4 py-3 pr-10 text-gray-900
                                   focus:border-blue-500 focus:outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {searchQuery && (
          <p className="mt-2 text-sm text-gray-500">
            Found {filteredShops.length} shop{filteredShops.length !== 1 && "s"}
          </p>
        )}
      </div>

      {/* Content */}
      {shops.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">No Shops in System</h2>
          <p className="text-gray-600">There are no shops registered yet.</p>
          <button
            onClick={() => router.push("/register-shop")}
            className="mt-4 px-5 py-2 rounded-md bg-blue-600
                                   text-white hover:bg-blue-700 transition"
          >
            Register First Shop
          </button>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-600">
          No shops found matching &#34;{searchQuery}&#34;
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {filteredShops.map((shop) => {
            const inventory = shopsWithInventory.get(shop.id) || [];
            return (
              <ShopCard
                key={shop.id}
                shop={shop}
                productCount={inventory.length}
                topProducts={inventory.map((item) => item.product.name)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
