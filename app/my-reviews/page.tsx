'use client';

import React, { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';
import { ProductReview, ShopReview } from '@/types';
import { productReviewApi, shopReviewApi } from '@/lib/api';
import { currentUser } from '@/lib/mockData';

export default function MyReviewsPage() {
    const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
    const [shopReviews, setShopReviews] = useState<ShopReview[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const [productData, shopData] = await Promise.all([
                productReviewApi.getMyReviews(),
                shopReviewApi.getMyReviews(),
            ]);

            setProductReviews(productData.content);
            setShopReviews(shopData.content);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderEmptyState = () => (
        <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
                You haven't written any {activeTab === 'products' ? 'product' : 'shop'} reviews yet.
            </p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Reviews</h1>
                <p className="text-gray-600">
                    Viewing reviews by {currentUser.name} ({currentUser.email})
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`${activeTab === 'products'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
                        >
                            Product Reviews ({productReviews.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('shops')}
                            className={`${activeTab === 'shops'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
                        >
                            Shop Reviews ({shopReviews.length})
                        </button>
                    </nav>
                </div>
            </div>

            {/* Product Reviews */}
            {activeTab === 'products' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : productReviews.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        productReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                            {review.productName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${review.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
                                                : review.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {review.status}
                                    </span>
                                </div>

                                <StarRating rating={review.rating} readonly size="md" showValue />

                                <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Product Quality</p>
                                        <StarRating rating={review.productQualityRating} readonly size="sm" showValue />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Delivery Speed</p>
                                        <StarRating rating={review.deliveryTimeRating} readonly size="sm" showValue />
                                    </div>
                                </div>

                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Shop Reviews */}
            {activeTab === 'shops' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : shopReviews.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        shopReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                            {review.shopName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${review.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
                                                : review.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {review.status}
                                    </span>
                                </div>

                                <StarRating rating={review.rating} readonly size="md" showValue />

                                <div className="grid grid-cols-3 gap-4 my-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Owner Interaction</p>
                                        <StarRating rating={review.ownerInteractionRating} readonly size="sm" showValue />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Shop Quality</p>
                                        <StarRating rating={review.shopQualityRating} readonly size="sm" showValue />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Delivery Speed</p>
                                        <StarRating rating={review.deliveryTimeRating} readonly size="sm" showValue />
                                    </div>
                                </div>

                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
