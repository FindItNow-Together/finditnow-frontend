export type DeliveryStatus =
  | "CREATED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "CANCELLED_BY_AGENT"
  | "UNASSIGNED";

export type DeliveryType = "INSTANT" | "SCHEDULED";

export interface DeliveryResponse {
  id: string;
  orderId: string;
  shopId: number;
  customerId: string;
  assignedAgentId: string;
  status: DeliveryStatus;
  type: DeliveryType;
  pickupAddress: string;
  deliveryAddress: string;
  instructions: string;
  deliveryCharge: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedDeliveryResponse {
  deliveries: DeliveryResponse[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
