"use client";

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, removeFromCart, increaseQuantity, decreaseQuantity, itemCount } =
    useCart();
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setProcessingItem(itemId);
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleIncreaseQuantity = async (itemId: string) => {
    setProcessingItem(itemId);
    try {
      await increaseQuantity(itemId);
    } catch (error) {
      console.error("Failed to increase quantity:", error);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleDecreaseQuantity = async (itemId: string) => {
    setProcessingItem(itemId);
    try {
      await decreaseQuantity(itemId);
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleCheckout = () => {
    if (!cart) return;
    router.push(`/checkout/${cart.id}`);
  };

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart to get started</p>
          <button
            onClick={() => router.push("/discover")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-600 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <button
            onClick={() => router.push("/discover")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue Shopping
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-600 mt-1">₹{item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        onClick={() => handleDecreaseQuantity(item.id)}
                        disabled={processingItem === item.id || isLoading}
                        className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.id)}
                        disabled={processingItem === item.id || isLoading}
                        className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={processingItem === item.id || isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Item subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-gray-900">₹{cart.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-500 text-xs">Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-500 text-xs">Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{cart.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.items.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Delivery fee and tax will be calculated during checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
