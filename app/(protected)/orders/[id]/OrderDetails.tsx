"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { OrderResponse } from "@/types/order";

interface PageProps {
  id: string;
}

const OrderDetails = ({ id: orderId }: PageProps) => {
  const router = useRouter();
  const api = useApi();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [delivery, setDelivery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/orders/${orderId}`, { auth: "private" });

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const fetchDelivery = async () => {
      try {
        const response = await api.get(`/api/deliveries/order/${orderId}`, { auth: "private" });
        if (response.ok) {
          const data = await response.json();
          setDelivery(data);
        }
      } catch (e) {
        console.error("Failed to fetch delivery", e);
      }
    };

    if (orderId) {
      fetchOrder();
      fetchDelivery();
    }
  }, [api, orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamic delivery updates
  const deliveryUpdates = [];

  if (order) {
    deliveryUpdates.push({
      status: "Order Placed",
      date: formatDate(order.createdAt),
      completed: true,
      icon: Package,
      description: "Order has been confirmed",
    });
  }

  if (delivery) {
    const statusMap: Record<string, number> = {
      PENDING: 0,
      ASSIGNED: 1,
      PICKED_UP: 2,
      DELIVERED: 3,
    };
    const currentLevel = statusMap[delivery.status] ?? 0;

    const steps = [
      { key: "PENDING", label: "Looking for Agent", desc: "We are assigning a delivery partner" },
      { key: "ASSIGNED", label: "Agent Assigned", desc: "Partner is on the way to shop" },
      { key: "PICKED_UP", label: "Out for Delivery", desc: "Agent has picked up your order" },
      { key: "DELIVERED", label: "Delivered", desc: "Package delivered" },
    ];

    steps.forEach((step, idx) => {
      // Only show steps relevant to the flow (simplified)
      // Or show all and mark completed
      const isCompleted = idx <= currentLevel;
      const isCurrent = idx === currentLevel;

      deliveryUpdates.push({
        status: step.label,
        date: isCurrent ? "In Progress" : isCompleted ? "Completed" : "Pending",
        completed: isCompleted,
        icon: isCompleted ? CheckCircle : Truck,
        description: step.desc,
      });
    });
  } else {
    // Fallback or "Self Pickup" logic could go here
    // For now, if no delivery record found (maybe just created), show generic
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The requested order could not be found."}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500">ID: {order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Items in this Order
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.priceAtOrder * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.priceAtOrder)} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Amount</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Delivery Status Timeline (Dummy Data) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  Delivery Updates
                </h2>
              </div>
              <div className="p-6">
                <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {deliveryUpdates.map((update, index) => {
                    const Icon = update.icon;
                    return (
                      <div key={index} className="relative">
                        <div
                          className={`absolute -left-[34px] p-1.5 rounded-full ring-4 ring-white ${
                            update.completed
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className={`${!update.completed && "opacity-60"}`}>
                          <p className="font-semibold text-gray-900">{update.status}</p>
                          <p className="text-sm text-gray-600">{update.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{update.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Order Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Date</p>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.paymentMethod} • {order.paymentStatus}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mt-1">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Shipping Details
              </h3>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {/* Note: In a real app we'd fetch the full address details */}
                    Delivery Location ID: {order.deliveryAddressId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
