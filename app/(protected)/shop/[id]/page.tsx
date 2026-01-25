"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shop } from "@/types/shop";
import { Product } from "@/types/product";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: "No Delivery Service",
  IN_HOUSE_DRIVER: "In-house Delivery Driver",
  THIRD_PARTY_PARTNER: "3rd Party Delivery Partner",
};

const formatCoordinate = (value?: number) => {
  if (value === undefined || value === null) {
    return "N/A";
  }
  return value.toFixed(6);
};

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params?.id ? Number(params.id) : null;

  const { productApi, shopApi, inventoryApi } = useApi();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && shopId) {
      loadShopDetails();
      loadProducts();
    }
  }, [isAuthenticated, shopId]);

  const loadShopDetails = async () => {
    if (!shopId) return;

    try {
      const response = await shopApi.getShop(shopId);
      setShop(response as Shop);
    } catch (err: any) {
      setError("Failed to load shop details");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!shopId) return;

    try {
      // Get inventory which contains products with shop-specific data (price, stock)
      const inventory = (await inventoryApi.getShopInventory(shopId)) as any[];
      // Map inventory to products with shop-specific data
      const prods = inventory.map((inv: any) => ({
        id: inv.product?.id || 0,
        name: inv.product?.name || "",
        description: inv.product?.description,
        imageUrl: inv.product?.imageUrl,
        category: inv.product?.category,
        price: inv.price,
        stock: inv.stock,
        reservedStock: inv.reservedStock,
        inventoryId: inv.id,
      }));
      setProducts(prods as any);
      setSelectedProducts(new Set()); // Clear selection on reload
    } catch (err: any) {
      setError("Failed to load products");
      console.error("Error loading products:", err);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await productApi.deleteMultiple(Array.from(selectedProducts));
      setShowDeleteConfirmation(false);
      loadProducts();
    } catch (err: any) {
      setError("Failed to delete products");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const toggleProductSelection = (productId: number) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  // if (isLoading) {
  //   return <div className="container">Loading...</div>;
  // }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="container">Loading shop details...</div>;
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-800">Shop Not Found</h1>

          <p className="mb-6 text-sm text-gray-600">
            The shop you are looking for does not exist or may have been removed.
          </p>

          <button
            onClick={() => {
              if (isAuthenticated && localStorage.getItem("role") === "ADMIN") {
                router.push("/admin/dashboard");
              } else {
                router.push("/dashboard");
              }
            }}
            className="
        inline-flex items-center justify-center
        rounded-md bg-blue-600 px-5 py-2.5
        text-sm font-medium text-white
        hover:bg-blue-700 transition
      "
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (isAuthenticated && localStorage.getItem("role") === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const isAdmin = typeof window !== "undefined" && localStorage.getItem("role") === "ADMIN";

  if (showDeleteConfirmation) {
    const productsToDelete = products.filter((p) => selectedProducts.has(p.id));

    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Confirm Deletion</h1>

          <button
            onClick={handleCancelDelete}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 transition"
          >
            Back
          </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-red-600">
            Are you sure you want to delete these products?
          </h2>

          <p className="mb-6 text-sm text-gray-600">
            The following {productsToDelete.length} product(s) will be permanently deleted. This
            action cannot be undone.
          </p>

          {/* Product List */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Products to be deleted</h3>

            <ul className="space-y-2">
              {productsToDelete.map((product) => (
                <li
                  key={product.id}
                  className="
              rounded-md border border-yellow-300
              bg-yellow-50 px-4 py-3
            "
                >
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    Price: ${product.price.toFixed(2)} • Stock: {product.stock}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="
          flex-1 rounded-md bg-red-600 px-4 py-2.5
          text-sm font-medium text-white
          hover:bg-red-700 transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
            >
              {deleting ? "Deleting..." : "Yes, Delete These Products"}
            </button>

            <button
              onClick={handleCancelDelete}
              disabled={deleting}
              className="
          flex-1 rounded-md bg-gray-200 px-4 py-2.5
          text-sm font-medium text-gray-800
          hover:bg-gray-300 transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
            >
              No, Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{shop.name}</h1>

        <button
          onClick={handleBack}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Shop Info */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-lg font-semibold text-gray-800">Shop Information</p>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* LEFT: Info */}
          <div className="flex-1 grid gap-3 text-sm text-gray-700">
            {isAdmin && (
              <p>
                <span className="font-medium">Owner ID:</span> {shop.ownerId}
              </p>
            )}
            <p>
              <span className="font-medium">Address:</span> {shop.address}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {shop.phone}
            </p>
            <p>
              <span className="font-medium">Open Hours:</span> {shop.openHours}
            </p>
            <p>
              <span className="font-medium">Delivery Option:</span>{" "}
              {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
            </p>
          </div>

          {/* RIGHT: Map */}
          <div className="w-full md:w-72 lg:w-80">
            <p className="mb-2 text-sm font-medium text-gray-700">Location</p>

            <div className="h-40 w-full overflow-hidden rounded-lg border border-gray-200">
              <MapContainer
                center={[shop.latitude, shop.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                dragging={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[shop.latitude, shop.longitude]}>
                  <Popup>{shop.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Products Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Products ({products.length})</h2>

          {!isAdmin && (
            <div className="flex gap-3">
              {selectedProducts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                >
                  Delete Selected ({selectedProducts.size})
                </button>
              )}

              <button
                onClick={handleAddProduct}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                + Add Product
              </button>
            </div>
          )}
        </div>

        {/* Product Form */}
        {showProductForm && (
          <div className="mb-6">
            <ProductForm
              shopId={shop.id}
              product={editingProduct}
              onSave={handleProductSaved}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {/* Search */}
        {products.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
              w-full rounded-md border-2 border-gray-300
              px-3 py-2 pr-10 text-sm
              focus:outline-none focus:border-blue-500 transition
            "
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {searchQuery && (
              <p className="mt-2 text-xs text-gray-600">
                Found {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>
        )}

        {/* Products Table / States */}
        {products.length === 0 ? (
          <p className="text-sm text-gray-600">
            No products found. {!isAdmin && "Add your first product!"}
          </p>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">
            No products found matching &#34;{searchQuery}&#34;
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  {!isAdmin && (
                    <th className="py-2 px-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedProducts.size === filteredProducts.length &&
                          filteredProducts.length > 0
                        }
                        onChange={toggleAllSelection}
                      />
                    </th>
                  )}
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2">Price</th>
                  <th className="py-2 px-2">Stock</th>
                  <th className="py-2 px-2">Category</th>
                  {!isAdmin && <th className="py-2 px-2">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {!isAdmin && (
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                    )}
                    <td className="py-2 px-2">{product.name}</td>
                    <td className="py-2 px-2">{product.description || "-"}</td>
                    <td className="py-2 px-2">${product.price.toFixed(2)}</td>
                    <td className="py-2 px-2">{product.stock}</td>
                    <td className="py-2 px-2">{product.category || "-"}</td>
                    {!isAdmin && (
                      <td className="py-2 px-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-300 transition"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
