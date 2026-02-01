"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-6">
        <ShoppingCart className="h-16 w-16 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
      </p>
      <Link
        href="/discover"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
      >
        Start Shopping
      </Link>
    </div>
  );
}
