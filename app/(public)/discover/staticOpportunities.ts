import { Opportunity } from "./types";

export const STATIC_OPPORTUNITIES: Opportunity[] = [
  {
    product: {
      id: "p1",
      name: "Milk 1L",
      imageUrl: "/placeholder-product.png",
      minPrice: 52,
      shopCount: 3,
      deliveryCount: 2,
    },
    shop: {
      id: "s1",
      name: "Ramesh Kirana",
      latitude: 18.5204,
      longitude: 73.8567,
      deliveryAvailable: true,
    },
    price: 52,
    distanceKm: 0.8,
    inventory: {
      inventoryId: 10,
      stock: 10,
      price: 100,
      reservedStock: 0,
    },
  },
  {
    product: {
      id: "p2",
      name: "Brown Bread",
      imageUrl: "/placeholder-product.png",
      minPrice: 38,
      shopCount: 2,
      deliveryCount: 1,
    },
    shop: {
      id: "s2",
      name: "City Bakery",
      latitude: 18.5189,
      longitude: 73.8553,
      deliveryAvailable: false,
    },
    price: 38,
    distanceKm: 1.2,
    inventory: {
      inventoryId: 4,
      stock: 5,
      price: 20,
      reservedStock: 2,
    },
  },
];
