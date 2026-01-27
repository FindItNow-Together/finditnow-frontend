"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import {
  AlertCircle,
  Box,
  CheckCircle,
  Clock,
  Package,
  Search,
  Truck,
  XCircle,
  Filter,
} from "lucide-react";
import { OrderResponse } from "@/types/order";

type OrderStatus =
  | "created"
  | "confirmed"
  | "paid"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "partially_paid" | "failed";
type DateGroup = "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "Older";

interface StatusConfig {
  color: string;
  icon: typeof Clock;
  label: string;
}

interface PaymentStatusConfig {
  color: string;
  label: string;
}

interface GroupedOrders {
  label: DateGroup;
  orders: OrderResponse[];
}

const OrdersPage = () => {
  const router = useRouter();
  const api = useApi();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/orders/mine", { auth: "private" });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: OrderResponse[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim() === "") {
        return true;
      }

      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.productName.toLowerCase().includes(query)) ||
        order.status.toLowerCase().includes(query) ||
        order.paymentStatus.toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusConfig = (status: string): StatusConfig => {
    const configs: Record<OrderStatus, StatusConfig> = {
      created: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Created" },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Confirmed" },
      paid: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Paid" },
      packed: { color: "bg-purple-100 text-purple-800", icon: Box, label: "Packed" },
      out_for_delivery: {
        color: "bg-orange-100 text-orange-800",
        icon: Truck,
        label: "Out for Delivery",
      },
      delivered: {
        color: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" },
    };
    return configs[status as OrderStatus] || configs.created;
  };

  const getPaymentStatusConfig = (status: string): PaymentStatusConfig => {
    const configs: Record<PaymentStatus, PaymentStatusConfig> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      partially_paid: { color: "bg-orange-100 text-orange-800", label: "Partially Paid" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
    };
    return configs[status as PaymentStatus] || configs.pending;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDateSeparator = (date: string): DateGroup => {
    const orderDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    orderDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (orderDate.getTime() === today.getTime()) return "Today";
    if (orderDate.getTime() === yesterday.getTime()) return "Yesterday";
    if (orderDate > lastWeek) return "Last 7 Days";
    if (orderDate > lastMonth) return "Last 30 Days";
    return "Older";
  };

  const groupOrdersByDate = (orders: OrderResponse[]): GroupedOrders[] => {
    const groups: Partial<Record<DateGroup, OrderResponse[]>> = {};

    orders.forEach((order) => {
      const separator = getDateSeparator(order.createdAt);
      if (!groups[separator]) groups[separator] = [];
      groups[separator]!.push(order);
    });

    const order: DateGroup[] = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"];
    return order
      .filter((key) => groups[key])
      .map((key) => ({
        label: key,
        orders: groups[key]!,
      }));
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const groupedOrders = useMemo(() => groupOrdersByDate(filteredOrders), [filteredOrders]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <button
            onClick={() => router.push("/discover")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            {orders.length} total {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by order ID, product, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="created">Created</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || statusFilter !== "all") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  Status: {getStatusConfig(statusFilter).label}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-xs text-gray-600 hover:text-gray-900 ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredOrders.length !== orders.length && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders found matching your filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedOrders.map((group) => (
              <div key={group.label}>
                {/* Date Separator */}
                <div className="flex items-center mb-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="px-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {group.label}
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Order Cards */}
                <div className="space-y-4">
                  {group.orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleOrderClick(order.id)}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {order.items.length} {order.items.length === 1 ? "item" : "items"}
                              </p>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                              {order.items.slice(0, 3).map((item, index) => (
                                <span key={item.id} className="text-sm text-gray-700">
                                  {item.productName} × {item.quantity}
                                  {index < Math.min(order.items.length - 1, 2) && ","}
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-sm font-medium text-blue-600">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                              {statusConfig.label}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${paymentConfig.color}`}
                            >
                              {paymentConfig.label}
                            </span>
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {order.paymentMethod === "online"
                                ? "Online Payment"
                                : "Cash on Delivery"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
