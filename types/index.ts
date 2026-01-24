// Review types matching backend DTOs
export interface ProductReview {
    id: number;
    userId: number;
    userName?: string;
    productId: number;
    productName?: string;
    orderId: number;
    rating: number;
    productQualityRating: number;
    deliveryTimeRating: number;
    comment: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
}

export interface ShopReview {
    id: number;
    userId: number;
    userName?: string;
    shopId: number;
    shopName?: string;
    orderId: number;
    rating: number;
    ownerInteractionRating: number;
    shopQualityRating: number;
    deliveryTimeRating: number;
    comment: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    approvedReviews: number;
    ratingDistribution: Record<string, number>;
    averageQualityRating?: number;
    averageDeliveryRating?: number;
    averageOwnerInteractionRating?: number;
    averageShopQualityRating?: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    shopId: number;
    shopName: string;
}

export interface Shop {
    id: number;
    name: string;
    description: string;
    image: string;
    ownerName: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface ProductReviewRequest {
    productId: number;
    orderId: number;
    rating: number;
    productQualityRating: number;
    deliveryTimeRating: number;
    comment: string;
}

export interface ShopReviewRequest {
    shopId: number;
    orderId: number;
    rating: number;
    ownerInteractionRating: number;
    shopQualityRating: number;
    deliveryTimeRating: number;
    comment: string;
}
