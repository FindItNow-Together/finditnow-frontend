import { Cart, CartItem } from "@/contexts/CartContext";

export const testCartItems: CartItem[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    productId: 101,
    productName: "Organic Whole Wheat Flour (5kg)",
    quantity: 2,
    price: 285.0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    productId: 102,
    productName: "Fresh Farm Eggs (30 count)",
    quantity: 1,
    price: 180.0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    productId: 103,
    productName: "Premium Basmati Rice (10kg)",
    quantity: 1,
    price: 950.0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    productId: 104,
    productName: "Extra Virgin Olive Oil (1L)",
    quantity: 2,
    price: 650.0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    productId: 105,
    productName: "Organic Honey (500g)",
    quantity: 1,
    price: 425.0,
  },
];

export const testCart: Cart = {
  id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  shopId: 42,
  items: testCartItems,
  subtotal: 3425.0, // (285*2) + 180 + 950 + (650*2) + 425
};

// Alternative: Empty cart for testing empty state
export const emptyCart: Cart = {
  id: "7c9e6679-7425-40de-944b-e07fc1f90ae8",
  shopId: 42,
  items: [],
  subtotal: 0,
};

// Alternative: Single item cart
export const singleItemCart: Cart = {
  id: "7c9e6679-7425-40de-944b-e07fc1f90ae9",
  shopId: 42,
  items: [
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      productId: 106,
      productName: "Dark Chocolate Bar (100g)",
      quantity: 1,
      price: 150.0,
    },
  ],
  subtotal: 150.0,
};
