import { Product } from "./product";
import { Shop } from "./shop";

// Matches backend InventoryResponse
export type InventoryItem = {
  id: number;
  reservedStock: number;
  price: number;
  stock: number;
  shop?: Shop;
  product: Product;
};

// Matches backend InventoryRequest - for adding existing products to inventory
export type InventoryRequest = {
  inventoryId?: number;
  reservedStock?: number;
  price: number;
  stock: number;
  shop?: Shop;
  product: {
    id: number;
  };
};

// For the addNew endpoint that creates product and adds to inventory
export type AddNewProductToInventoryParams = {
  price: number;
  stock: number;
};
