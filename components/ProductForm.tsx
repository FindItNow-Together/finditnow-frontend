"use client";

import { useState, useEffect } from "react";
import { Product, ProductRequest } from "@/types/product";
import useApi from "@/hooks/useApi";

interface ProductFormProps {
  shopId: number;
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({ shopId, product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductRequest>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { productApi } = useApi();

  // Populate form when in Edit mode
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category: product.category || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (product) {
        await productApi.update(product.id, formData);
      } else {
        await productApi.add(shopId, formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? value === ""
            ? 0
            : parseFloat(value)
          : name === "stock"
            ? value === ""
              ? 0
              : parseInt(value)
            : value,
    }));
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {product ? "📝 Edit Product" : "✨ Add New Product"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            Product Name *
          </label>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="text"
            id="name"
            name="name"
            placeholder="e.g. Fresh Sourdough Bread"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe your product..."
          />
        </div>

        {/* Price and Stock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
              Price ($) *
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              type="number"
              id="price"
              name="price"
              value={formData.price || ""}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="stock">
              Available Stock *
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              type="number"
              id="stock"
              name="stock"
              value={formData.stock || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
            Category
          </label>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="text"
            id="category"
            name="category"
            placeholder="e.g. Bakery, Dairy, Organic"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Processing..." : product ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg transition"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
