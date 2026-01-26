"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useApi from "@/hooks/useApi";
import { testCart } from "@/test_files/cart-related";

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  shopId: number;
  items: CartItem[];
  subtotal: number;
}

// Shop inventory item that gets added to cart
export interface ShopInventoryItem {
  id: number; // inventory_id
  productId: number;
  productName: string;
  shopId: number;
  price: number;
  stock: number;
  reservedStock: number;
}

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;
  isLoading: boolean;
  error: string | null;

  setCart: (cart: Cart) => void;
  clearCart: () => void;

  // Cart operations
  addToCart: (inventoryItem: ShopInventoryItem, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  increaseQuantity: (cartItemId: string) => Promise<void>;
  decreaseQuantity: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;

  itemCount: number;
  availableStock: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCartState] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  const setCart = useCallback((c: Cart) => {
    setCartState(c);
    setError(null);
  }, []);

  const clearCart = useCallback(() => {
    setCartState(null);
    setError(null);
  }, []);

  const itemCount = useMemo(() => {
    return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }, [cart]);

  // Get available stock for a product (used for validation)
  const availableStock = useCallback(
    (productId: number): number => {
      const item = cart?.items.find((i) => i.productId === productId);
      return item?.quantity ?? 0;
    },
    [cart]
  );

  // Add item to cart
  const addToCart = useCallback(
    async (inventoryItem: ShopInventoryItem, quantity: number = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate stock availability
        const availableStock = inventoryItem.stock - inventoryItem.reservedStock;
        if (quantity > availableStock) {
          throw new Error(`Only ${availableStock} items available in stock`);
        }

        // Check if adding to different shop's cart
        if (cart && cart.shopId !== inventoryItem.shopId) {
          const confirmed = confirm(
            "Your cart contains items from a different shop. Do you want to clear your cart and add this item?"
          );
          if (!confirmed) {
            setIsLoading(false);
            return;
          }
          // Clear existing cart first
          if (cart.id) {
            await api.del(`/api/cart/${cart.id}`, undefined, { auth: "private" });
          }
          setCartState(null);
        }

        // Call API to add to cart
        const response = await api.post(
          "/api/cart/items",
          {
            cartId: cart?.id ?? null,
            shopId: inventoryItem.shopId,
            inventoryId: inventoryItem.id,
            productId: inventoryItem.productId,
            productName: inventoryItem.productName,
            price: inventoryItem.price,
            quantity,
          },
          { auth: "private" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add item to cart");
        }

        const updatedCart = await response.json();
        setCartState(updatedCart);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart, api]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (!cart) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.del(`/api/cart/${cart.id}/items/${cartItemId}`, undefined, {
          auth: "private",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove item");
        }

        const updatedCart = await response.json();

        // If cart is now empty, clear it
        if (updatedCart.items.length === 0) {
          setCartState(null);
        } else {
          setCartState(updatedCart);
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart, api]
  );

  // Update quantity to specific value
  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (!cart) return;

      if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.put(
          `/api/cart/${cart.id}/items/${cartItemId}`,
          { quantity },
          { auth: "private" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update quantity");
        }

        const updatedCart = await response.json();
        setCartState(updatedCart);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart, api]
  );

  // Increase quantity by 1
  const increaseQuantity = useCallback(
    async (cartItemId: string) => {
      if (!cart) return;

      const item = cart.items.find((i) => i.id === cartItemId);
      if (!item) return;

      await updateQuantity(cartItemId, item.quantity + 1);
    },
    [cart, updateQuantity]
  );

  // Decrease quantity by 1
  const decreaseQuantity = useCallback(
    async (cartItemId: string) => {
      if (!cart) return;

      const item = cart.items.find((i) => i.id === cartItemId);
      if (!item) return;

      // If quantity is 1, remove item instead
      if (item.quantity === 1) {
        await removeFromCart(cartItemId);
        return;
      }

      await updateQuantity(cartItemId, item.quantity - 1);
    },
    [cart, removeFromCart, updateQuantity]
  );

  useEffect(() => {
    setCart(testCart);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId: cart?.id ?? null,
        isLoading,
        error,
        setCart,
        clearCart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        itemCount,
        availableStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
