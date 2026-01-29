"use client";

import { useState, useEffect } from "react";
import { Product, ProductRequest } from "@/types/product";
import useApi from "@/hooks/useApi";
import useDebounce from "@/hooks/useDebounce";
import CreateableSelect from "./CreateableSelect";

interface ProductFormProps {
  shopId: number;
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({ shopId, product, onSave, onCancel }: ProductFormProps) {
  // Mode: "create" for new product, "existing" for adding existing product
  const [mode, setMode] = useState<"create" | "existing">("create");

  const [formData, setFormData] = useState<ProductRequest>({
    name: "",
    description: "",
    category: "",
  });

  // Inventory-specific fields (price and stock)
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  // For searching and selecting existing product
  const [searchQuery, setSearchQuery] = useState("");
  const { query: debouncedSearchQuery, setDebounceQuery } = useDebounce("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<
    { label: string; value: string } | undefined
  >(undefined);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { productApi, inventoryApi } = useApi();

  // Search products when debounced query changes
  const searchProducts = async (query: string) => {
    setLoadingSearch(true);
    try {
      const products = (await productApi.search(query)) as Product[];
      setSearchResults(products);
    } catch (err) {
      console.error("Failed to search products", err);
      setError("Failed to search products");
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const trimmedQuery =
      typeof debouncedSearchQuery === "string" ? debouncedSearchQuery.trim() : "";
    if (mode === "existing" && !product && trimmedQuery.length >= 2) {
      searchProducts(trimmedQuery);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, mode, product]);

  // Populate form when in Edit mode
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category?.name || "",
      });
      if (product.category) {
        setSelectedCategory({
          label: product.category.name,
          value: String(product.category.id),
        });
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (product) {
        // Update product (only product details, not inventory)
        const payload = {
          ...formData,
          categoryId: selectedCategory ? selectedCategory.value : undefined,
          category: undefined,
        };
        await productApi.update(product.id, payload);
      } else if (mode === "existing") {
        // Add existing product to inventory
        if (!selectedProduct) {
          setError("Please select a product");
          setLoading(false);
          return;
        }
        await inventoryApi.addInventory(shopId, {
          productId: selectedProduct.id,
          price,
          stock,
        });
      } else {
        // Create new product (global) and add to shop inventory
        const payload = {
          ...formData,
          categoryId: selectedCategory ? selectedCategory.value : undefined,
          category: undefined,
        };
        const created = (await productApi.add(payload)) as Product;
        await inventoryApi.addInventory(shopId, {
          productId: created.id,
          price,
          stock,
        });
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
      [name]: value,
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value === "" ? 0 : parseFloat(value));
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStock(value === "" ? 0 : parseInt(value));
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {product ? "📝 Edit Product" : "✨ Add Product to Inventory"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Selection (only when adding new) */}
        {!product && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Source</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="create"
                  checked={mode === "create"}
                  onChange={() => {
                    setMode("create");
                    setSearchQuery("");
                    setSelectedProduct(null);
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Create New Product</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="existing"
                  checked={mode === "existing"}
                  onChange={() => setMode("existing")}
                  className="mr-2"
                />
                <span className="text-sm">Add Existing Product</span>
              </label>
            </div>
          </div>
        )}

        {/* Existing Product Search */}
        {mode === "existing" && !product && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Product *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Type to search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDebounceQuery(e.target.value);
              }}
            />
            {loadingSearch && <p className="mt-2 text-sm text-gray-500">Searching...</p>}
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
              <p className="mt-2 text-sm text-gray-500">Type at least 2 characters to search</p>
            )}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setSearchQuery(prod.name);
                      setSearchResults([]);
                    }}
                    className={`p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 ${
                      selectedProduct?.id === prod.id ? "bg-blue-100" : ""
                    }`}
                  >
                    <p className="font-medium text-gray-800">{prod.name}</p>
                    <p className="text-sm text-gray-600">
                      {prod.category?.name || "No category"} •{" "}
                      {prod.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim().length >= 2 && !loadingSearch && searchResults.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">No products found</p>
            )}
            {selectedProduct && searchResults.length === 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Selected: {selectedProduct.name}
                </p>
                <p className="text-xs text-green-600">
                  {selectedProduct.description || "No description"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Product Details (only for create mode or edit mode) */}
        {(mode === "create" || product) && (
          <>
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                Category
              </label>
              <CreateableSelect
                type="PRODUCT"
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val || undefined)}
                placeholder="Select or create a product category..."
              />
            </div>
          </>
        )}

        {/* Price and Stock (always shown when adding to inventory) */}
        {!product && (
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
                value={price || ""}
                onChange={handlePriceChange}
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
                value={stock || ""}
                onChange={handleStockChange}
                min="0"
                required
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Processing..." : product ? "Update Product" : "Add to Inventory"}
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
