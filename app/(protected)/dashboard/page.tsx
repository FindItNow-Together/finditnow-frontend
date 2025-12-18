"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Shop} from "@/types/shop";
import {Product} from "@/types/product";
import ShopCard from "@/components/ShopCard";
import {useAuth} from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";

export default function DashboardPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [shopsWithProducts, setShopsWithProducts] = useState<
        Map<number, Product[]>
    >(new Map());
    const [loading, setLoading] = useState(true);
    const {productApi, shopApi} = useApi();
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const {isAuthenticated, logout} = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            loadShops();
        }
    }, [isAuthenticated]);

    const loadShops = async () => {
        try {
            const shops: Shop[] = (await shopApi.getMyShops()) as Shop[];
            setShops(shops || []);

            // Load products for each shop
            const productsMap = new Map<number, Product[]>();
            await Promise.all(
                shops.map(async (shop) => {
                    try {
                        const products = await productApi.getByShop(shop.id) as Product[];
                        productsMap.set(shop.id, products);
                    } catch (err) {
                        console.error(`Failed to load products for shop ${shop.id}`, err);
                        productsMap.set(shop.id, []);
                    }
                })
            );

            setShopsWithProducts(productsMap);
        } catch (err: any) {
            setError("Failed to load shops");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout(() => {
            router.push("/login");
        });
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

            // Search in product names
            const products = shopsWithProducts.get(shop.id) || [];
            const matchesProducts = products.some((product) =>
                product.name.toLowerCase().includes(query)
            );

            return matchesShop || matchesProducts;
        });
    }, [shops, searchQuery, shopsWithProducts]);

    // if (isLoading) {
    //   return <div className="container">Loading...</div>;
    // }

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return <div className="container">Loading shops...</div>;
    }

    if (shops.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header Navbar */}
                <header className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        {/* Logo Section */}
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => router.push("/")}
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                ShopManager
              </span>
                        </div>

                        {/* Action Section */}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content (Empty State) */}
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        {/* Decorative Icon/Graphic */}
                        <div
                            className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
                            <span className="text-4xl">🏪</span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            No shops found
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Your system currently has no registered shops. Get started by
                            creating your first storefront to manage products and inventory.
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

                {/* Footer (Optional) */}
                <footer className="py-6 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} ShopManager Admin Portal
                </footer>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">My Shops</h1>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                    Logout
                </button>
            </div>

            {/* Error */}
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

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
                </div>

                {searchQuery && (
                    <p className="mt-2 text-sm text-gray-600">
                        Found {filteredShops.length}{" "}
                        {filteredShops.length === 1 ? "shop" : "shops"}
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
                        const products = shopsWithProducts.get(shop.id) || [];
                        const topProducts = products.map((p) => p.name);

                        return (
                            <ShopCard
                                key={shop.id}
                                shop={shop}
                                productCount={products.length}
                                topProducts={topProducts}
                            />
                        );
                    })}
                </div>
            )}
        </div>

    );
}
