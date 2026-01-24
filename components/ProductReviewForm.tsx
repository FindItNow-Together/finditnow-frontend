'use client';

import React, { useState } from 'react';
import StarRating from './StarRating';
import { ProductReviewRequest } from '@/types';

interface ProductReviewFormProps {
    productId: number;
    productName: string;
    orderId: number;
    onSubmit: (data: ProductReviewRequest) => Promise<void>;
    onCancel?: () => void;
}

export default function ProductReviewForm({
    productId,
    productName,
    orderId,
    onSubmit,
    onCancel,
}: ProductReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [qualityRating, setQualityRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0 || qualityRating === 0 || deliveryRating === 0) {
            setError('Please provide all ratings');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Please write a comment with at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                productId,
                orderId,
                rating,
                productQualityRating: qualityRating,
                deliveryTimeRating: deliveryRating,
                comment: comment.trim(),
            });

            // Reset form
            setRating(0);
            setQualityRating(0);
            setDeliveryRating(0);
            setComment('');
        } catch (err: any) {
            setError(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Write a Review for {productName}</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overall Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Rating <span className="text-red-500">*</span>
                    </label>
                    <StarRating rating={rating} onChange={setRating} size="lg" showValue />
                </div>

                {/* Product Quality Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Quality <span className="text-red-500">*</span>
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
                        placeholder="Share your experience with this product..."
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
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
