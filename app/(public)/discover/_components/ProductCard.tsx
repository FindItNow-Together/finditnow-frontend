"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function ProductCard({ product, opportunities }: any) {
  const { addToCart } = useCart();
  const router = useRouter();
  const best = opportunities[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 flex gap-4">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-xl font-semibold text-blue-600 mb-4">₹ ???</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
            Add to cart
          </button>
          <button
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors"
            onClick={() => router.push(`/shop/${best.shop.id}?focus=${product.id}`)}
          >
            View Shops
          </button>
        </div>
      </div>
    </div>
  );
}
