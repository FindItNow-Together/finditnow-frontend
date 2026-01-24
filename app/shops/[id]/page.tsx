'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StarRating from '@/components/StarRating';
import ReviewList from '@/components/ReviewList';
import ReviewStatsDisplay from '@/components/ReviewStatsDisplay';
import { Shop, ShopReview, ReviewStats, ShopReviewRequest } from '@/types';
import { shopApi, shopReviewApi } from '@/lib/api';

export default function ShopDetailPage() {
    const params = useParams();
    const shopId = parseInt(params.id as string);

    const [shop, setShop] = useState<Shop | null>(null);
    const [reviews, setReviews] = useState<ShopReview[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    // Form state
    const [rating, setRating] = useState(0);
    const [ownerRating, setOwnerRating] = useState(0);
    const [qualityRating, setQualityRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadShopData();
    }, [shopId]);

    const loadShopData = async () => {
        setLoading(true);
        try {
            const [shopData, reviewsData, statsData] = await Promise.all([
                shopApi.getById(shopId),
                shopReviewApi.getByShop(shopId),
                shopReviewApi.getStats(shopId),
            ]);

            setShop(shopData);
            setReviews(reviewsData.content);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0 || ownerRating === 0 || qualityRating === 0 || deliveryRating === 0) {
            setError('Please provide all ratings');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Please write a comment with at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            const reviewData: ShopReviewRequest = {
                shopId,
                orderId: 200 + shopId,
                rating,
                ownerInteractionRating: ownerRating,
                shopQualityRating: qualityRating,
                deliveryTimeRating: deliveryRating,
                comment: comment.trim(),
            };

            // Create the review and get the response with the new review
            const newReview = await shopReviewApi.create(reviewData);

            // Immediately add the new review to the top of the list
            setReviews(prevReviews => [newReview, ...prevReviews]);

            setSuccess('Review submitted successfully!');
            setShowReviewForm(false);

            // Reset form
            setRating(0);
            setOwnerRating(0);
            setQualityRating(0);
            setDeliveryRating(0);
            setComment('');
            setIsSubmitting(false);

            // Reload stats to update rating averages
            const newStats = await shopReviewApi.getStats(shopId);
            setStats(newStats);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError('Failed to submit review. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (loading || !shop) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Link */}
            <a
                href="/shops"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Shops
            </a>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                    {success}
                </div>
            )}

            {/* Shop Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Shop Image */}
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-200 rounded-lg overflow-hidden">
                        <img
                            src={shop.image}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Shop Info */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{shop.name}</h1>
                        <p className="text-gray-600 mb-4">{shop.description}</p>
                        <p className="text-sm text-gray-500 mb-6">
                            Owner: <span className="font-medium text-gray-700">{shop.ownerName}</span>
                        </p>

                        {stats && stats.averageRating > 0 && (
                            <div className="flex items-center gap-4 mb-6">
                                <StarRating rating={stats.averageRating} readonly size="lg" showValue />
                                <span className="text-gray-600">
                                    ({stats.approvedReviews} review{stats.approvedReviews !== 1 ? 's' : ''})
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition"
                        >
                            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                    <h3 className="text-xl font-semibold mb-4">Write a Review for {shop.name}</h3>

                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        {/* Overall Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Overall Rating <span className="text-red-500">*</span>
                            </label>
                            <StarRating rating={rating} onChange={setRating} size="lg" showValue />
                        </div>

                        {/* Owner Interaction Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Owner Interaction <span className="text-red-500">*</span>
                            </label>
                            <StarRating rating={ownerRating} onChange={setOwnerRating} size="md" showValue />
                        </div>

                        {/* Shop Quality Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shop Quality <span className="text-red-500">*</span>
                            </label>
                            <StarRating rating={qualityRating} onChange={setQualityRating} size="md" showValue />
                        </div>

                        {/* Delivery Time Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Speed <span className="text-red-500">*</span>
                            </label>
                            <StarRating rating={deliveryRating} onChange={setDeliveryRating} size="md" showValue />
                        </div>

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this shop..."
                                rows={5}
                                maxLength={2000}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">Minimum 10 characters</span>
                                <span className="text-xs text-gray-500">{comment.length}/2000</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reviews List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                    <ReviewList reviews={reviews as any} />
                </div>

                {/* Stats Sidebar */}
                {stats && (
                    <div>
                        <ReviewStatsDisplay stats={stats} type="shop" />
                    </div>
                )}
            </div>
        </div>
    );
}
