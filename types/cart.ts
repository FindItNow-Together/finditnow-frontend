export interface CartItem {
  itemId: string;
  inventoryId: number;
  quantity: number;
  addedAt?: string;
  productId: number;
  productName: string;
  price: number;
  itemSubtotal: number;
}

export interface Cart {
  cartId: string;
  userId: string;
  shopId: number;
  status: "ACTIVE" | "CHECKED_OUT";
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface AddToCartRequest {
  inventoryId: number;
  shopId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  cartId: string;
  userId: string;
  shopId: number;
  status: "ACTIVE" | "CHECKED_OUT";
  items: CartItem[];
  totalItems: number;
}
