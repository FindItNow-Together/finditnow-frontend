'use client'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";
import useShopCart from "@/hooks/useShopCart";
import {MapLocation} from "@/types/mapLocation";
import {LocationMap} from "@/app/_components/Map";
import useApi from "@/hooks/useApi";

type Product = {
    id: string;
    name: string;
    image?: string;
    minPrice: number;
    shopCount: number;
    deliveryCount: number;
    rating?: number;
};

type Shop = {
    id: string;
    name: string;
    category?: string;
    lat: number;
    lng: number;
    open: boolean;
    deliveryAvailable: boolean;
    distanceMeters?: number;
    image?: string;
    priceForProduct?: number;
};

export default function MarketplaceMainPage() {
    const [productCategory, setProductCategory] = useState('all');
    const [shopQuery, setShopQuery] = useState('');
    const [productQuery, setProductQuery] = useState('');
    const [shopCategory, setShopCategory] = useState('all');

    const {query: debProductQuery, setDebounceQuery: setDebounceProductQuery} = useDebounce(productQuery);
    const {query: debShopQuery, setDebounceQuery: setDebouceShopQuery} = useDebounce(shopQuery);

    const [products, setProducts] = useState<Product[]>([]);
    const [productPage, setProductPage] = useState(1);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);

    const [shops, setShops] = useState<Shop[]>([]);
    const api = useApi();

    const shopLocations: MapLocation<Shop>[] = shops.map((s) => ({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        data: s,
    }));

    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    const cart = useShopCart();

    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    useEffect(() => {
        if (!('geolocation' in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            pos => setUserLoc({lat: pos.coords.latitude, lng: pos.coords.longitude}),
            () => {/* ignore errors */},
            {timeout: 3000}
        );
    }, []);

    const fetchingProductsRef = useRef(false);
    const fetchProducts = useCallback(async (page = 1, append = false) => {
        if (fetchingProductsRef.current) return;
        fetchingProductsRef.current = true;
        try {
            const params = new URLSearchParams();
            if (debProductQuery) params.set('q', debProductQuery as string);
            if (productCategory) params.set('category', productCategory);
            if (userLoc) {
                params.set('lat', String(userLoc.lat));
                params.set('lng', String(userLoc.lng));
            }
            params.set('page', String(page));
            const res = await api.get(`/api/search/products?${params.toString()}`);
            const body = await res.json();
            if (append) setProducts(prev => [...prev, ...body.items]); else setProducts(body.items);
            setHasMoreProducts(Boolean(body.hasMore));
            setProductPage(page);

            if (body.items && body.items.length) {
                const topProductId = body.items[0].id;
                await fetchShopsForProduct(topProductId);
            } else {
                fetchShops();
            }
        } catch (e) {
            console.error('fetchProducts', e);
        } finally {
            fetchingProductsRef.current = false;
        }
    }, [debProductQuery, productCategory, userLoc]);

    const fetchShopsForProduct = useCallback(async (productId: string) => {
        try {
            const params = new URLSearchParams();
            if (debShopQuery) params.set('q', debShopQuery as string);
            if (shopCategory) params.set('category', shopCategory);
            if (userLoc) {
                params.set('lat', String(userLoc.lat));
                params.set('lng', String(userLoc.lng));
            }
            params.set('productId', productId);
            const res = await api.get(`/api/shop/search?${params.toString()}`);
            const body = await res.json();
            const ranked: Shop[] = body.items.sort((a: Shop, b: Shop) => {
                if (a.deliveryAvailable !== b.deliveryAvailable) return a.deliveryAvailable ? -1 : 1;
                const da = a.distanceMeters ?? Number.POSITIVE_INFINITY;
                const db = b.distanceMeters ?? Number.POSITIVE_INFINITY;
                if (da !== db) return da - db;
                const pa = a.priceForProduct ?? Number.POSITIVE_INFINITY;
                const pb = b.priceForProduct ?? Number.POSITIVE_INFINITY;
                return pa - pb;
            });
            setShops(ranked);
        } catch (e) {
            console.error('fetchShopsForProduct', e);
        }
    }, [debShopQuery, shopCategory, userLoc]);

    const fetchShops = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (debShopQuery) params.set('q', debShopQuery as string);
            if (shopCategory) params.set('category', shopCategory);
            if (userLoc) {
                params.set('lat', String(userLoc.lat));
                params.set('lng', String(userLoc.lng));
            }
            const res = await api.get(`/api/shop/all`);
            const body = await res.json();
            const ranked: Shop[] = body.items.sort((a: Shop, b: Shop) => {
                if (a.deliveryAvailable !== b.deliveryAvailable) return a.deliveryAvailable ? -1 : 1;
                const da = a.distanceMeters ?? Number.POSITIVE_INFINITY;
                const db = b.distanceMeters ?? Number.POSITIVE_INFINITY;
                return da - db;
            });
            setShops(ranked);
        } catch (e) {
            console.error('fetchShops', e);
        }
    }, [debShopQuery, shopCategory, userLoc]);

    useEffect(() => {
        if (debProductQuery) {
            fetchProducts(1, false);
        } else if (debShopQuery) {
            fetchShops();
        } else {
            fetchProducts(1, false);
            fetchShops();
        }
    }, [debProductQuery, debShopQuery, fetchProducts, fetchShops]);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!loadMoreRef.current) return;
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && hasMoreProducts) {
                    fetchProducts(productPage + 1, true);
                }
            });
        }, {rootMargin: '200px'});
        obs.observe(loadMoreRef.current);
        return () => obs.disconnect();
    }, [loadMoreRef.current, hasMoreProducts, productPage]);

    async function selectShop(shop: Shop) {
        setSelectedShop(shop);
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* DUAL SEARCH BAR */}
            <header className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                value={productQuery}
                                onChange={(e) => {
                                    setProductQuery(e.target.value);
                                    setDebounceProductQuery(e.target.value)
                                }}
                                placeholder="Search products..."
                                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400"
                            />
                            <select
                                value={productCategory}
                                onChange={e => setProductCategory(e.target.value)}
                                className="outline-none text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="books">Books</option>
                                <option value="hardware">Hardware</option>
                                <option value="groceries">Groceries</option>
                            </select>
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow active:scale-95"
                                onClick={() => fetchProducts(1, false)}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <input
                                value={shopQuery}
                                onChange={(e) => {
                                    setShopQuery(e.target.value);
                                    setDebouceShopQuery(e.target.value);
                                }}
                                placeholder="Search shops..."
                                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400"
                            />
                            <select
                                value={shopCategory}
                                onChange={e => setShopCategory(e.target.value)}
                                className="outline-none text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="hardware">Hardware</option>
                                <option value="kirana">Kirana</option>
                                <option value="bakery">Bakery</option>
                            </select>
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow active:scale-95"
                                onClick={() => fetchShops()}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Product pane */}
                <section className="lg:col-span-7 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">Products</h2>
                            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {products.length} results
                            </div>
                        </div>

                        <div className="space-y-3">
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
                                >
                                    <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                                        <img
                                            src={p.image ?? '/placeholder-product.png'}
                                            alt={p.name}
                                            className="w-24 h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-slate-900 mb-1 truncate">{p.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <span className="font-semibold text-blue-600">₹{p.minPrice}</span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                {p.shopCount} shops
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                                {p.deliveryCount} deliver
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all duration-200 active:scale-95"
                                        onClick={() => {
                                            fetchShopsForProduct(p.id);
                                        }}
                                    >
                                        View Shops
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div ref={loadMoreRef} className="h-8"/>
                        {!hasMoreProducts && products.length > 0 && (
                            <div className="text-center text-slate-400 py-8 text-sm">
                                No more products to show
                            </div>
                        )}
                    </div>
                </section>

                {/* Map + Shops pane */}
                <aside className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-900">Nearby Shops</h2>
                            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {shops.length} found
                            </div>
                        </div>

                        <div className="mb-6 h-80 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                            <LocationMap
                                locations={shopLocations}
                                userLocation={userLoc}
                                renderPopup={(loc) => {
                                    const shop = loc.data;
                                    return (
                                        <div className="p-2 space-y-2">
                                            <div className="font-semibold text-slate-900">{shop.name}</div>
                                            <div className="text-sm text-slate-600 flex items-center gap-2">
                                                <span className={`inline-block w-2 h-2 rounded-full ${shop.open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {shop.open ? "Open" : "Closed"}
                                                {shop.deliveryAvailable && " · Delivery"}
                                            </div>

                                            {shop.priceForProduct && (
                                                <div className="text-sm font-semibold text-blue-600">
                                                    ₹{shop.priceForProduct}
                                                </div>
                                            )}

                                            <button
                                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg px-3 py-2 font-medium transition-colors"
                                                onClick={() => setSelectedShop(shop)}
                                            >
                                                Enter Shop
                                            </button>
                                        </div>
                                    );
                                }}
                                onMarkerClick={(loc) => setSelectedShop(loc.data)}
                            />
                        </div>

                        <div className="space-y-3 max-h-96 overflow-auto pr-2 custom-scrollbar">
                            {shops.map(s => (
                                <div
                                    key={s.id}
                                    className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white cursor-pointer"
                                    onClick={() => selectShop(s)}
                                >
                                    <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                                        <img
                                            src={s.image ?? '/placeholder-shop.png'}
                                            alt={s.name}
                                            className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-slate-900 truncate">{s.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span>{s.category}</span>
                                            {s.deliveryAvailable && (
                                                <>
                                                    <span>·</span>
                                                    <span>Delivers</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {s.distanceMeters && (
                                            <span className="text-xs text-slate-500 font-medium">
                                                {Math.round(s.distanceMeters / 1000)} km
                                            </span>
                                        )}
                                        <button
                                            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors active:scale-95"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectShop(s);
                                            }}
                                        >
                                            Enter
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>

            {/* Selected shop modal */}
            {selectedShop && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900">{selectedShop.name}</h2>
                                <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                                    <span className={`inline-flex items-center gap-1.5 ${selectedShop.open ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className={`inline-block w-2 h-2 rounded-full ${selectedShop.open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {selectedShop.open ? 'Open Now' : 'Closed'}
                                    </span>
                                    <span>·</span>
                                    <span>{selectedShop.category}</span>
                                    {selectedShop.deliveryAvailable && (
                                        <>
                                            <span>·</span>
                                            <span className="text-blue-600">Delivery Available</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                                    onClick={() => setSelectedShop(null)}
                                >
                                    Close
                                </button>
                                <button
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow active:scale-95"
                                    onClick={() => {/* open shop checkout */}}
                                >
                                    Go to Checkout
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                                <p className="text-sm text-slate-600">
                                    Browse and add items to your cart. All products from this shop will be grouped together.
                                </p>
                            </div>

                            <h3 className="font-semibold text-slate-900 mb-4">Shop Catalog</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Example item */}
                                <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                                            <img
                                                src="/placeholder-product.png"
                                                alt="Example Product"
                                                className="w-20 h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-slate-900">Example Product</h4>
                                            <p className="text-lg font-semibold text-blue-600 mt-1">₹99</p>
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all active:scale-95"
                                            onClick={() => cart.addToCart(selectedShop.id, 'example-product-1')}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
