"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shop } from "@/types/shop";
import { InventoryItem } from "@/types/inventory";
import { OrderResponse } from "@/types/order";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import useApi from "@/hooks/useApi";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { ShoppingCart } from "lucide-react";

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

  const { inventoryApi, shopApi, productApi, get } = useApi();
  const { addToCart, itemCount } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isAuthenticated, userData } = useAuth();

  const [selectedInventory, setSelectedInventory] = useState<Set<number>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // Dashboard Stats State
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [earnings, setEarnings] = useState<number>(0);
  const [recentProducts, setRecentProducts] = useState<string[]>([]);
  const [orderPage, setOrderPage] = useState(0);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && shopId) {
      loadShopDetails();
      loadInventory();
      loadDashboardData();

      // Polling for real-time updates (every 30 seconds)
      const intervalId = setInterval(() => {
        refreshDashboardData();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, shopId]);

  const loadDashboardData = async () => {
    loadOrders(0, true);
    loadEarnings();
    loadRecentProducts();
  };

  const refreshDashboardData = async () => {
    setRefreshing(true);
    // Refresh earnings and recent products
    // For orders, we only refresh the first page to check for new ones
    try {
      await Promise.all([
        loadOrders(0, true), // Reset orders list with fresh data
        loadEarnings(),
        loadRecentProducts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const loadOrders = async (page: number, reset: boolean = false) => {
    if (!shopId) return;
    try {
      if (!reset) setLoadingOrders(true);
      const res = await get(`/api/orders/shop/${shopId}?page=${page}&size=10`, { auth: "private" });
      if (res.ok) {
        const data = await res.json();
        const newOrders = data.content;

        if (reset) {
          setOrders(newOrders);
          setOrderPage(0);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
          setOrderPage(page);
        }

        setHasMoreOrders(!data.last);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadEarnings = async () => {
    if (!shopId) return;
    try {
      const res = await get(`/api/orders/shop/${shopId}/earnings`, { auth: "private" });
      if (res.ok) {
        const amount = await res.json();
        setEarnings(amount || 0);
      }
    } catch (err) {
      console.error("Failed to load earnings", err);
    }
  };

  const loadRecentProducts = async () => {
    if (!shopId) return;
    try {
      const res = await get(`/api/orders/shop/${shopId}/recent-products`, { auth: "private" });
      if (res.ok) {
        const products = await res.json();
        setRecentProducts(products);
      }
    } catch (err) {
      console.error("Failed to load recent products", err);
    }
  };

  const handleLoadMoreOrders = () => {
    loadOrders(orderPage + 1);
  };

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

  const loadInventory = async () => {
    if (!shopId) return;

    try {
      const items = (await inventoryApi.getShopInventory(shopId)) as InventoryItem[];
      setInventory(items);
      setSelectedInventory(new Set()); // Clear selection on reload
    } catch (err: any) {
      setError("Failed to load inventory");
    }
  };

  const handleAddProduct = () => {
    setEditingInventoryItem(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (item: InventoryItem) => {
    setEditingInventoryItem(item);
    setShowProductForm(true);
  };

  const handleBulkDelete = () => {
    if (selectedInventory.size === 0) return;
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await productApi.deleteMultiple(Array.from(selectedInventory));
      setShowDeleteConfirmation(false);
      loadInventory();
    } catch (err: any) {
      setError("Failed to delete inventory items");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const toggleInventorySelection = (inventoryId: number) => {
    const newSelection = new Set(selectedInventory);
    if (newSelection.has(inventoryId)) {
      newSelection.delete(inventoryId);
    } else {
      newSelection.add(inventoryId);
    }
    setSelectedInventory(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedInventory.size === filteredInventory.length) {
      setSelectedInventory(new Set());
    } else {
      setSelectedInventory(new Set(filteredInventory.map((item) => item.id)));
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingInventoryItem(null);
    loadInventory();
  };

  const handleAddToCart = async (item: InventoryItem) => {
    setAddingToCart(item.id);
    try {
      await addToCart(
        {
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          shopId: shopId!,
          price: item.price,
          stock: item.stock,
          reservedStock: item.reservedStock,
        },
        1
      );
      // Show success feedback (you can add a toast notification here)
      alert(`Added ${item.product.name} to cart!`);
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      alert(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  // Filter inventory based on search query
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) {
      return inventory;
    }

    const query = searchQuery.toLowerCase();
    return inventory.filter((item) => {
      return (
        item.product.name.toLowerCase().includes(query) ||
        (item.product.description && item.product.description.toLowerCase().includes(query)) ||
        (item.product.category && item.product.category.name.toLowerCase().includes(query))
      );
    });
  }, [inventory, searchQuery]);

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
  const isOwner = !isAdmin && shop && userData?.id === shop.ownerId;
  const isCustomer = !isAdmin && !isOwner;

  if (showDeleteConfirmation) {
    const itemsToDelete = inventory.filter((item) => selectedInventory.has(item.id));

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
            The following {itemsToDelete.length} product(s) will be permanently deleted. This action
            cannot be undone.
          </p>

          {/* Product List */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Products to be deleted</h3>

            <ul className="space-y-2">
              {itemsToDelete.map((item) => (
                <li
                  key={item.id}
                  className="
              rounded-md border border-yellow-300
              bg-yellow-50 px-4 py-3
            "
                >
                  <p className="font-medium text-gray-800">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    Price: ${item.price.toFixed(2)} • Stock: {item.stock}
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

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Earnings Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
            {refreshing && <span className="text-xs text-blue-500 animate-pulse">Updating...</span>}
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(earnings)}
          </p>
          <p className="mt-2 text-xs text-gray-500">Lifetime earnings from all completed orders</p>
        </div>

        {/* Recent Products Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-gray-500">Recently Ordered Products</h3>
          {recentProducts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentProducts.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No recent orders yet</p>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Order History ({orders.length}+)</h2>
          <button
            onClick={() => refreshDashboardData()}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Now"}
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {/* We don't have customer name in OrderResponse yet, using ID or placeholder */}
                        User
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                           ${
                             order.status === "created"
                               ? "bg-gray-100 text-gray-800"
                               : order.status === "delivered"
                                 ? "bg-green-100 text-green-800"
                                 : order.status === "cancelled"
                                   ? "bg-red-100 text-red-800"
                                   : "bg-blue-100 text-blue-800"
                           }
                         `}
                        >
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.paymentStatus === "paid" ? (
                          <span className="text-green-600 font-medium">Paid</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMoreOrders && (
              <div className="text-center pt-2">
                <button
                  onClick={handleLoadMoreOrders}
                  disabled={loadingOrders}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {loadingOrders ? "Loading..." : "Load More Orders"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Products Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Products ({inventory.length})</h2>

          {!isAdmin && (
            <div className="flex gap-3">
              {selectedInventory.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                >
                  Delete Selected ({selectedInventory.size})
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
              product={editingInventoryItem?.product || null}
              onSave={handleProductSaved}
              onCancel={() => {
                setShowProductForm(false);
                setEditingInventoryItem(null);
              }}
            />
          </div>
        )}

        {/* Search */}
        {inventory.length > 0 && (
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
                Found {filteredInventory.length}{" "}
                {filteredInventory.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>
        )}

        {/* Products Table / States */}
        {inventory.length === 0 ? (
          <p className="text-sm text-gray-600">
            No products found. {!isAdmin && "Add your first product!"}
          </p>
        ) : filteredInventory.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">
            No products found matching &#34;{searchQuery}&#34;
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  {!(isAdmin || isCustomer) && (
                    <th className="py-2 px-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedInventory.size === filteredInventory.length &&
                          filteredInventory.length > 0
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
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {!isAdmin && isOwner && (
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={selectedInventory.has(item.id)}
                          onChange={() => toggleInventorySelection(item.id)}
                        />
                      </td>
                    )}
                    <td className="py-2 px-2">{item.product.name}</td>
                    <td className="py-2 px-2">{item.product.description || "-"}</td>
                    <td className="py-2 px-2">₹{item.price.toFixed(2)}</td>
                    <td className="py-2 px-2">{item.stock}</td>
                    <td className="py-2 px-2">{item.product.category?.name || "-"}</td>

                    {/* Actions column - different for owner vs customer */}
                    {isOwner && (
                      <td className="py-2 px-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(item);
                          }}
                          className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-300 transition"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                    {isCustomer && (
                      <td className="py-2 px-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart === item.id || item.stock === 0}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {addingToCart === item.id ? (
                            "Adding..."
                          ) : (
                            <>
                              <ShoppingCart className="h-3 w-3" />
                              {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </>
                          )}
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
