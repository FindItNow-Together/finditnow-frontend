"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function ProductCard({ product, opportunities }: any) {
  const { addToCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  // const best = opportunities[0];
  const isShopPage = pathname.startsWith("/shops/");

  // 2. Pick cheapest among them
  const best = opportunities
    .filter((o) => o.inventory.stock - o.inventory.reservedStock > 0)
    .sort((a, b) => a.inventory.price - b.inventory.price)[0];

  // 3. If nothing is available
  if (!best) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 opacity-60">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-red-500 text-sm mt-1">Out of stock</p>
      </div>
    );
  }

  const availableStock = best.inventory.stock - best.inventory.reservedStock;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 flex gap-4">
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL + product.imageUrl}
          alt={product.name}
          className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
        />
      ) : (
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>

        {/* Price */}
        <p className="text-xl font-semibold text-blue-600 mb-1">₹ {best.inventory.price}</p>

        {/* Meta */}
        <p className="text-sm text-gray-500 mb-2">
          {availableStock} in stock · Sold by <span className="font-medium">{best.shop.name}</span>
        </p>

        {best.distanceKm && (
          <p className="text-xs text-gray-400 mb-3">{best.distanceKm.toFixed(1)} km away</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg"
            onClick={() =>
              addToCart(
                {
                  id: best.inventory.inventoryId,
                  productId: Number(product.id),
                  productName: product.name,
                  shopId: Number(best.shop.id),
                  price: best.inventory.price,
                  stock: best.inventory.stock,
                  reservedStock: best.inventory.reservedStock,
                },
                1
              )
            }
          >
            Add to cart
          </button>

          {!isShopPage && (
            <button
              className="border px-3 py-2 rounded-lg text-sm"
              onClick={() => router.push(`/shops/${best.shop.id}?focus=${product.id}`)}
            >
              View Shop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
