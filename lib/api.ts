import {
    ProductReview,
    ShopReview,
    ReviewStats,
    ProductReviewRequest,
    ShopReviewRequest,
    Product,
    Shop,
} from '@/types';
import {
    mockProducts,
    mockShops,
    mockProductReviews,
    mockShopReviews,
    currentUser,
} from './mockData';

// Toggle between mock and real API
const USE_MOCK_API = false; // Using REAL API - Backend is running!
const API_BASE_URL = 'http://localhost:8080/api';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==== LOCAL STORAGE HELPERS ====
const getStoredReviews = (key: 'product_reviews' | 'shop_reviews', defaultData: any[]) => {
    if (typeof window === 'undefined') return defaultData;
    const stored = localStorage.getItem(key);
    if (!stored) {
        // Initialize with default mock data if empty
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
    }
    return JSON.parse(stored);
};

const saveReviews = (key: 'product_reviews' | 'shop_reviews', data: any[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

// ==== PRODUCT API ====

export const productApi = {
    getAll: async (): Promise<Product[]> => {
        if (USE_MOCK_API) {
            await delay(300);
            return mockProducts;
        }
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getById: async (id: number): Promise<Product | null> => {
        if (USE_MOCK_API) {
            await delay(200);
            return mockProducts.find(p => p.id === id) || null;
        }
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) return null;
        return response.json();
    },
};

// ==== SHOP API ====

export const shopApi = {
    getAll: async (): Promise<Shop[]> => {
        if (USE_MOCK_API) {
            await delay(300);
            return mockShops;
        }
        const response = await fetch(`${API_BASE_URL}/shops`);
        if (!response.ok) throw new Error('Failed to fetch shops');
        return response.json();
    },

    getById: async (id: number): Promise<Shop | null> => {
        if (USE_MOCK_API) {
            await delay(200);
            return mockShops.find(s => s.id === id) || null;
        }
        const response = await fetch(`${API_BASE_URL}/shops/${id}`);
        if (!response.ok) return null;
        return response.json();
    },
};

// ==== PRODUCT REVIEW API ====

export const productReviewApi = {
    create: async (data: ProductReviewRequest): Promise<ProductReview> => {
        if (USE_MOCK_API) {
            await delay(500);
            const newReview: ProductReview = {
                id: Math.max(...mockProductReviews.map(r => r.id)) + 1,
                userId: currentUser.id,
                userName: currentUser.name,
                productId: data.productId,
                productName: mockProducts.find(p => p.id === data.productId)?.name || '',
                orderId: data.orderId,
                rating: data.rating,
                productQualityRating: data.productQualityRating,
                deliveryTimeRating: data.deliveryTimeRating,
                comment: data.comment,
                status: 'APPROVED', // Instant approval
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockProductReviews.push(newReview);
            return newReview;
        }
        // Real API call
        const response = await fetch(`${API_BASE_URL}/reviews/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit review');
        }

        return response.json();
    },

    getByProduct: async (productId: number, page: number = 0, size: number = 10) => {
        if (USE_MOCK_API) {
            await delay(400);
            const reviews = mockProductReviews
                .filter(r => r.productId === productId && r.status === 'APPROVED')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const start = page * size;
            const end = start + size;

            return {
                content: reviews.slice(start, end),
                totalElements: reviews.length,
                totalPages: Math.ceil(reviews.length / size),
                pageable: { pageNumber: page, pageSize: size },
            };
        }
        // Real API call
        const response = await fetch(
            `${API_BASE_URL}/reviews/products/${productId}/list?page=${page}&size=${size}`
        );
        return response.json();
    },

    getStats: async (productId: number): Promise<ReviewStats> => {
        if (USE_MOCK_API) {
            await delay(300);
            const reviews = mockProductReviews.filter(
                r => r.productId === productId && r.status === 'APPROVED'
            );

            if (reviews.length === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    approvedReviews: 0,
                    ratingDistribution: {},
                    averageQualityRating: 0,
                    averageDeliveryRating: 0,
                };
            }

            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            const avgQuality = reviews.reduce((sum, r) => sum + r.productQualityRating, 0) / reviews.length;
            const avgDelivery = reviews.reduce((sum, r) => sum + r.deliveryTimeRating, 0) / reviews.length;

            const distribution: Record<string, number> = {};
            reviews.forEach(r => {
                const key = r.rating.toString();
                distribution[key] = (distribution[key] || 0) + 1;
            });

            return {
                averageRating: Number(avgRating.toFixed(1)),
                totalReviews: mockProductReviews.filter(r => r.productId === productId).length,
                approvedReviews: reviews.length,
                ratingDistribution: distribution,
                averageQualityRating: Number(avgQuality.toFixed(1)),
                averageDeliveryRating: Number(avgDelivery.toFixed(1)),
            };
        }
        // Real API call
        const response = await fetch(`${API_BASE_URL}/reviews/products/${productId}/stats`);
        return response.json();
    },

    getMyReviews: async (page: number = 0, size: number = 10) => {
        if (USE_MOCK_API) {
            await delay(400);
            const reviews = mockProductReviews
                .filter(r => r.userId === currentUser.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const start = page * size;
            const end = start + size;

            return {
                content: reviews.slice(start, end),
                totalElements: reviews.length,
                totalPages: Math.ceil(reviews.length / size),
                pageable: { pageNumber: page, pageSize: size },
            };
        }
        // Real API call
        const response = await fetch(
            `${API_BASE_URL}/reviews/products/my-reviews?page=${page}&size=${size}`
        );
        return response.json();
    },
};

// ==== SHOP REVIEW API ====

export const shopReviewApi = {
    create: async (data: ShopReviewRequest): Promise<ShopReview> => {
        if (USE_MOCK_API) {
            await delay(500);
            const newReview: ShopReview = {
                id: Math.max(...mockShopReviews.map(r => r.id)) + 1,
                userId: currentUser.id,
                userName: currentUser.name,
                shopId: data.shopId,
                shopName: mockShops.find(s => s.id === data.shopId)?.name || '',
                orderId: data.orderId,
                rating: data.rating,
                ownerInteractionRating: data.ownerInteractionRating,
                shopQualityRating: data.shopQualityRating,
                deliveryTimeRating: data.deliveryTimeRating,
                comment: data.comment,
                status: 'APPROVED', // Instant approval
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockShopReviews.push(newReview);
            return newReview;
        }
        // Real API call
        const response = await fetch(`${API_BASE_URL}/reviews/shops`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit review');
        }

        return response.json();
    },

    getByShop: async (shopId: number, page: number = 0, size: number = 10) => {
        if (USE_MOCK_API) {
            await delay(400);
            const reviews = mockShopReviews
                .filter(r => r.shopId === shopId && r.status === 'APPROVED')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const start = page * size;
            const end = start + size;

            return {
                content: reviews.slice(start, end),
                totalElements: reviews.length,
                totalPages: Math.ceil(reviews.length / size),
                pageable: { pageNumber: page, pageSize: size },
            };
        }
        // Real API call
        const response = await fetch(
            `${API_BASE_URL}/reviews/shops/${shopId}/list?page=${page}&size=${size}`
        );
        return response.json();
    },

    getStats: async (shopId: number): Promise<ReviewStats> => {
        if (USE_MOCK_API) {
            await delay(300);
            const reviews = mockShopReviews.filter(
                r => r.shopId === shopId && r.status === 'APPROVED'
            );

            if (reviews.length === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    approvedReviews: 0,
                    ratingDistribution: {},
                    averageOwnerInteractionRating: 0,
                    averageShopQualityRating: 0,
                    averageDeliveryRating: 0,
                };
            }

            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            const avgOwner = reviews.reduce((sum, r) => sum + r.ownerInteractionRating, 0) / reviews.length;
            const avgShopQuality = reviews.reduce((sum, r) => sum + r.shopQualityRating, 0) / reviews.length;
            const avgDelivery = reviews.reduce((sum, r) => sum + r.deliveryTimeRating, 0) / reviews.length;

            const distribution: Record<string, number> = {};
            reviews.forEach(r => {
                const key = r.rating.toString();
                distribution[key] = (distribution[key] || 0) + 1;
            });

            return {
                averageRating: Number(avgRating.toFixed(1)),
                totalReviews: mockShopReviews.filter(r => r.shopId === shopId).length,
                approvedReviews: reviews.length,
                ratingDistribution: distribution,
                averageOwnerInteractionRating: Number(avgOwner.toFixed(1)),
                averageShopQualityRating: Number(avgShopQuality.toFixed(1)),
                averageDeliveryRating: Number(avgDelivery.toFixed(1)),
            };
        }
        // Real API call
        const response = await fetch(`${API_BASE_URL}/reviews/shops/${shopId}/stats`);
        return response.json();
    },

    getMyReviews: async (page: number = 0, size: number = 10) => {
        if (USE_MOCK_API) {
            await delay(400);
            const reviews = mockShopReviews
                .filter(r => r.userId === currentUser.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const start = page * size;
            const end = start + size;

            return {
                content: reviews.slice(start, end),
                totalElements: reviews.length,
                totalPages: Math.ceil(reviews.length / size),
                pageable: { pageNumber: page, pageSize: size },
            };
        }
        // Real API call
        const response = await fetch(
            `${API_BASE_URL}/reviews/shops/my-reviews?page=${page}&size=${size}`
        );
        return response.json();
    },
};
