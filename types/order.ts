export interface OrderItemResponse {
  id: string;
  productId: number;
  productName: string;
  priceAtOrder: number;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  userId: string;
  shopId: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryAddressId: string;
  createdAt: string;
  items: OrderItemResponse[];
  /** Set when order is cancelled: "customer" | "delivery_agent" */
  cancelledBy?: string;
  /** Set when order is cancelled */
  cancellationReason?: string;
  /** Set when order is cancelled (ISO date string) */
  cancelledAt?: string;
}
