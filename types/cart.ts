export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName?: string;
}

export interface Cart {
  id: string;
  userId: string;
  shopId: string;
  shopName?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartRequest {
  productId: string;
  shopId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  data: Cart;
  message?: string;
}

