'use client';

import React from 'react';
import StarRating from './StarRating';
import { ProductReview } from '@/types';

interface ReviewListProps {
    reviews: ProductReview[];
    loading?: boolean;
}

export default function ReviewList({ reviews, loading }: ReviewListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
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
                <p className="mt-1 text-sm text-gray-500">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                                    {review.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} readonly size="md" showValue />
                        </div>
                        {review.status === 'PENDING' && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Pending Approval
                            </span>
                        )}
                    </div>

                    {/* Ratings Breakdown */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Product Quality</p>
                            <StarRating rating={review.productQualityRating} readonly size="sm" showValue />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Delivery Speed</p>
                            <StarRating rating={review.deliveryTimeRating} readonly size="sm" showValue />
                        </div>
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
