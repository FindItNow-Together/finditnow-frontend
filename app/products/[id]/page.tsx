'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StarRating from '@/components/StarRating';
import ProductReviewForm from '@/components/ProductReviewForm';
import ReviewList from '@/components/ReviewList';
import ReviewStatsDisplay from '@/components/ReviewStatsDisplay';
import { Product, ProductReview, ReviewStats } from '@/types';
import { productApi, productReviewApi } from '@/lib/api';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = parseInt(params.id as string);

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProductData();
    }, [productId]);

    const loadProductData = async () => {
        setLoading(true);
        try {
            const [productData, reviewsData, statsData] = await Promise.all([
                productApi.getById(productId),
                productReviewApi.getByProduct(productId),
                productReviewApi.getStats(productId),
            ]);

            setProduct(productData);
            setReviews(reviewsData.content);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading product data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (data: any) => {
        try {
            // Create the review and get the response with the new review
            const newReview = await productReviewApi.create(data);

            // Immediately add the new review to the top of the list
            setReviews(prevReviews => [newReview, ...prevReviews]);

            setSuccess('Review submitted successfully!');
            setShowReviewForm(false);

            // Reload stats to update rating averages
            const newStats = await productReviewApi.getStats(productId);
            setStats(newStats);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (error) {
            throw error;
        }
    };

    if (loading || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Link */}
            <a
                href="/"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Products
            </a>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                    {success}
                </div>
            )}

            {/* Product Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        <p className="text-sm text-gray-500 mb-6">
                            Sold by <span className="font-medium text-gray-700">{product.shopName}</span>
                        </p>
                        <div className="text-4xl font-bold text-primary-600 mb-6">
                            ${product.price}
                        </div>

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
                <div className="mb-8">
                    <ProductReviewForm
                        productId={productId}
                        productName={product.name}
                        orderId={100 + productId} // Mock order ID for testing
                        onSubmit={handleSubmitReview}
                        onCancel={() => setShowReviewForm(false)}
                    />
                </div>
            )}

            {/* Reviews Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reviews List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                    <ReviewList reviews={reviews} />
                </div>

                {/* Stats Sidebar */}
                {stats && (
                    <div>
                        <ReviewStatsDisplay stats={stats} type="product" />
                    </div>
                )}
            </div>
        </div>
    );
}
