'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import { Shop, ReviewStats } from '@/types';
import { shopApi, shopReviewApi } from '@/lib/api';

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [stats, setStats] = useState<Record<number, ReviewStats>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShops();
    }, []);

    const loadShops = async () => {
        setLoading(true);
        try {
            const shopsData = await shopApi.getAll();
            setShops(shopsData);

            const statsData: Record<number, ReviewStats> = {};
            for (const shop of shopsData) {
                const shopStats = await shopReviewApi.getStats(shop.id);
                statsData[shop.id] = shopStats;
            }
            setStats(statsData);
        } catch (error) {
            console.error('Error loading shops:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Shops</h1>
                <p className="text-gray-600">
                    Browse shops and read customer reviews | Using Mock Data
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => {
                    const shopStats = stats[shop.id];

                    return (
                        <Link
                            key={shop.id}
                            href={`/shops/${shop.id}`}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden group"
                        >
                            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center overflow-hidden">
                                <img
                                    src={shop.image}
                                    alt={shop.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                                    {shop.name}
                                </h3>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {shop.description}
                                </p>

                                <p className="text-xs text-gray-500 mb-3">
                                    Owner: <span className="font-medium">{shop.ownerName}</span>
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    {shopStats && shopStats.averageRating > 0 ? (
                                        <>
                                            <StarRating rating={shopStats.averageRating} readonly size="sm" showValue />
                                            <span className="text-sm text-gray-600">
                                                ({shopStats.approvedReviews})
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-500">No reviews yet</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
