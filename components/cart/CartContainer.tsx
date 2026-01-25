"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import useApi from "@/hooks/useApi";
import { Cart, CartResponse } from "@/types/cart";
import CartItemCard from "./CartItemCard";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import { Loader2, AlertCircle } from "lucide-react";

interface CartContainerProps {
  shopId: string;
}

export default function CartContainer({ shopId }: CartContainerProps) {
  const { userData } = useAuth();
  const { setCurrentCart } = useCart();
  const api = useApi();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!userData?.id || !shopId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.cartApi.getCart(userData.id, shopId);
      const cartData = (response as CartResponse).data || (response as Cart);
      setCart(cartData);
      setCurrentCart(cartData);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart. Please try again.");
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userData?.id, shopId]);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;

    try {
      await api.cartApi.updateItem(itemId, { quantity });
      await fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      throw err;
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!cart) return;

    try {
      await api.cartApi.removeItem(itemId);
      await fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      throw err;
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout flow
    console.log("Checkout clicked");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={fetchCart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary cart={cart} onCheckout={handleCheckout} />
        </div>
      </div>
    </div>
  );
}

