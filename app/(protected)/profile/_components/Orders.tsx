"use client";

import { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { OrderResponse } from "@/types/order"; // You'll need to create this type

interface OrdersSectionProps {
  orders: OrderResponse[] | null;
  onOrdersLoad: (orders: OrderResponse[]) => void;
}

export default function OrdersSection({ orders, onOrdersLoad }: OrdersSectionProps) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders only if not already loaded
  useEffect(() => {
    if (orders !== null) {
      // Orders already loaded, skip fetch
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/api/orders/mine", { auth: "private" });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        onOrdersLoad(data); // Pass orders to parent for caching
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
        onOrdersLoad([]); // Set empty array to prevent infinite loading
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [orders, api, onOrdersLoad]);

  // Filter orders based on search query
  const filteredOrders = orders?.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.paymentStatus.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; border: string }> = {
      delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      out_for_delivery: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
      packed: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      created: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
      paid: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    };

    return statusMap[status.toLowerCase()] || statusMap.created;
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white rounded-lg p-5 border border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <p className="text-gray-600 text-sm mt-1">Your order history</p>
        </div>
        <input
          type="search"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full lg:w-72 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Loading orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to load orders</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {searchQuery ? "No orders found" : "No orders yet"}
              </p>
              <p className="text-gray-600 text-sm">
                {searchQuery ? "Try a different search term" : "Your orders will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const statusColors = getStatusColor(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                          {order.status?.toLowerCase() === "cancelled" && order.cancellationReason && (
                            <span className="text-xs text-gray-500 max-w-[200px] truncate" title={order.cancellationReason}>
                              {order.cancellationReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <a
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
