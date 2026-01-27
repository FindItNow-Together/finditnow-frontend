import { Opportunity } from "./types";

export const STATIC_OPPORTUNITIES: Opportunity[] = [
  {
    product: {
      id: "p1",
      name: "Milk 1L",
      image: "/placeholder-product.png",
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
  },
  {
    product: {
      id: "p2",
      name: "Brown Bread",
      image: "/placeholder-product.png",
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
  },
];
