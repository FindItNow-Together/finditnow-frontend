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
import { Cart, CartItem, CartResponse } from "@/types/cart";
import { useAuth } from "@/contexts/AuthContext";

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
  clearCartState: () => void;
  loadCart: (shopId: number) => Promise<void>;

  // Cart operations
  addToCart: (inventoryItem: ShopInventoryItem, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  increaseQuantity: (cartItemId: string) => Promise<void>;
  decreaseQuantity: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  itemCount: number;
  availableStock: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCartState] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { userData } = useAuth();

  const setCart = useCallback((c: Cart) => {
    setCartState(c);
    setError(null);
  }, []);

  const clearCartState = useCallback(() => {
    setCartState(null);
    setError(null);
  }, []);

  const itemCount = useMemo(() => {
    return cart?.totalItems ?? 0;
  }, [cart]);

  // Get available stock for a product (used for validation)
  const availableStock = useCallback(
    (productId: number): number => {
      const item = cart?.items.find((i) => i.inventoryId === productId);
      return item?.quantity ?? 0;
    },
    [cart]
  );

  // Load cart for a specific shop
  const loadCart = useCallback(
    async (shopId: number) => {
      if (!userData?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.cartApi.getCart(userData.id, String(shopId)) as CartResponse;
        setCartState(response as Cart);
      } catch (err: any) {
        // Cart doesn't exist yet - this is okay
        if (err.message.includes("404")) {
          setCartState(null);
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userData, api]
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
          if (cart.cartId) {
            await api.cartApi.clearCart(cart.cartId);
          }
          setCartState(null);
        }

        // Call API to add to cart
        const response = await api.cartApi.addItem({
          inventoryId: inventoryItem.id,
          shopId: inventoryItem.shopId,
          quantity,
        }) as CartResponse;

        setCartState(response as Cart);
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
        await api.cartApi.removeItem(cartItemId);

        // Reload the cart to get updated state
        if (userData?.id) {
          await loadCart(cart.shopId);
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart, api, userData, loadCart]
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
        const response = await api.cartApi.updateItem(cartItemId, { quantity }) as CartResponse;
        setCartState(response as Cart);
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

      const item = cart.items.find((i) => i.itemId === cartItemId);
      if (!item) return;

      await updateQuantity(cartItemId, item.quantity + 1);
    },
    [cart, updateQuantity]
  );

  // Decrease quantity by 1
  const decreaseQuantity = useCallback(
    async (cartItemId: string) => {
      if (!cart) return;

      const item = cart.items.find((i) => i.itemId === cartItemId);
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

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!cart?.cartId) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.cartApi.clearCart(cart.cartId);
      setCartState(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, api]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId: cart?.cartId ?? null,
        isLoading,
        error,
        setCart,
        clearCartState,
        loadCart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
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
