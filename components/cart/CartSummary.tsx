"use client";

import { Cart } from "@/types/cart";

interface CartSummaryProps {
  cart: Cart;
  onCheckout?: () => void;
  isLoading?: boolean;
}

export default function CartSummary({ cart, onCheckout, isLoading = false }: CartSummaryProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Total Items</span>
          <span className="font-medium">{cart.totalItems}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">₹{cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">₹{cart.subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={isLoading || cart.totalItems === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </button>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Shipping and taxes calculated at checkout
      </p>
    </div>
  );
}
