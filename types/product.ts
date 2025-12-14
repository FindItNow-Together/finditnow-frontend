export interface Product {
  id: number;
  shopId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

