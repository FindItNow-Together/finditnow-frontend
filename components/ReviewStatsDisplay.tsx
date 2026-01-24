'use client';

import React from 'react';
import StarRating from './StarRating';
import { ReviewStats } from '@/types';

interface ReviewStatsProps {
    stats: ReviewStats;
    type: 'product' | 'shop';
}

export default function ReviewStatsDisplay({ stats, type }: ReviewStatsProps) {
    // Safe helpers to avoid undefined errors
    const safeRating = stats?.averageRating || 0;
    const safeApproved = stats?.approvedReviews || 0;
    const safeTotal = stats?.totalReviews || 0;

    const getCountForRating = (rating: number) => {
        if (!stats.ratingDistribution) return 0;
        const str = rating.toString();
        // Check "5", "5.0", "5.00"
        return (stats.ratingDistribution[str] || 0) +
            (stats.ratingDistribution[str + '.0'] || 0) +
            (stats.ratingDistribution[str + '.00'] || 0);
    };

    const getRatingPercentage = (rating: number) => {
        if (safeApproved === 0) return 0;
        return (getCountForRating(rating) / safeApproved) * 100;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>

            {/* Average Rating */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                        {safeRating > 0 ? safeRating.toFixed(1) : 'N/A'}
                    </div>
                    <StarRating rating={safeRating} readonly size="lg" />
                    <p className="text-sm text-gray-600 mt-2">
                        Based on {safeApproved} review{safeApproved !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700 w-6">{rating}</span>
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${getRatingPercentage(rating)}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                                {getCountForRating(rating)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Criteria Breakdown */}
            {safeApproved > 0 && (
                <div>
                    <h4 className="font-semibold mb-4">Rating Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {type === 'product' && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Product Quality</span>
                                    <span className="text-lg font-semibold text-primary-600">
                                        {stats.averageQualityRating ? stats.averageQualityRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Delivery Speed</span>
                                    <span className="text-lg font-semibold text-green-600">
                                        {stats.averageDeliveryRating ? stats.averageDeliveryRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                            </>
                        )}
                        {type === 'shop' && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Owner Interaction</span>
                                    <span className="text-lg font-semibold text-purple-600">
                                        {stats.averageOwnerInteractionRating ? stats.averageOwnerInteractionRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Shop Quality</span>
                                    <span className="text-lg font-semibold text-blue-600">
                                        {stats.averageShopQualityRating ? stats.averageShopQualityRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Delivery Speed</span>
                                    <span className="text-lg font-semibold text-green-600">
                                        {stats.averageDeliveryRating ? stats.averageDeliveryRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
