"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bike,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { OrderResponse } from "@/types/order";
import LocationMap from "@/app/_components/Map/Map";
import L from "leaflet";
import { useWebSocket } from "@/contexts/WebSocketContext";

const CANCELLABLE_STATUSES = ["created", "confirmed", "paid", "pending_confirmation"];

function isCancellable(order: OrderResponse): boolean {
  return CANCELLABLE_STATUSES.includes(order.status.toLowerCase());
}

interface PageProps {
  id: string;
}

const OrderDetails = ({ id: orderId }: PageProps) => {
  const router = useRouter();
  const api = useApi();
  const { socket, connect, disconnect } = useWebSocket();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [delivery, setDelivery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);

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

        // Mock agent location for demonstration (replace with actual API data)
        if (data.status === "PICKED_UP" || data.status === "ASSIGNED") {
          setAgentLocation({
            lat: data.currentLatitude || 18.52, // Replace with actual coordinates from API
            lng: data.currentLongitude || 73.85,
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch delivery", e);
    }
  };

  // Connect/Disconnect WebSocket based on order state
  useEffect(() => {
    const trackableStatuses = ["PICKED_UP", "ASSIGNED"];

    if (orderId && delivery && trackableStatuses.includes(delivery.status)) {
      connect(orderId);
      setMapExpanded(true); // Auto-expand map when tracking starts
    }

    return () => disconnect();
  }, [orderId, delivery?.status, connect, disconnect]);

  // Handle Incoming WebSocket Messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "LOCATION_UPDATE") {
          setAgentLocation({
            lat: data.lat,
            lng: data.lng,
          });
        }
      } catch (err) {
        console.error("WS Message Error:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchDelivery();
    }
  }, [orderId]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return "N/A";
    }

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

  const handleCancelOrder = async () => {
    const trimmed = cancelReason.trim();
    if (trimmed.length < 5) return;
    setCancelSubmitting(true);
    try {
      const response = await api.put(
        `/api/orders/${orderId}/cancel`,
        { reason: trimmed },
        { auth: "private" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data?.error || `Request failed (${response.status})`;
        toast.error(msg);
        return;
      }
      toast.success("Order cancelled successfully");
      setCancelModalOpen(false);
      setCancelReason("");
      setOrder(data as OrderResponse);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const showCancelButton = order && isCancellable(order);
  const isCancelled = order?.status?.toLowerCase() === "cancelled";
  const cancelReasonValid = cancelReason.trim().length >= 5;

  // Create bike icon for delivery agent
  const bikeIcon = L.divIcon({
    html: `
      <div style="
        background-color: #10b981;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="15" cy="5" r="1"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Delivery updates data
  const deliveryUpdates = [
    {
      status: "Order Placed",
      date: formatDate(order?.createdAt),
      completed: true,
      icon: Package,
      description: "Order has been received",
    },
  ];

  // Add pending confirmation step
  const isPendingOrBeyond =
    order &&
    [
      "pending_confirmation",
      "confirmed",
      "paid",
      "preparing",
      "ready",
      "picked_up",
      "delivered",
    ].includes(order.status.toLowerCase());

  deliveryUpdates.push({
    status: "Pending Confirmation",
    date: isPendingOrBeyond ? "Completed" : "Waiting for shop",
    completed: !!isPendingOrBeyond,
    icon: Clock,
    description: "Waiting for shop to confirm your order",
  });

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
  }

  const showAgentMap =
    delivery &&
    (delivery.status === "PICKED_UP" || delivery.status === "ASSIGNED") &&
    agentLocation;

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

            {/* Delivery Agent Map (Expandable) */}
            {showAgentMap && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="w-full p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between"
                >
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <Bike className="w-5 h-5 mr-2 text-green-600" />
                    Live Tracking
                    {socket && (
                      <span
                        className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"
                        title="Live"
                      />
                    )}
                  </h2>
                  {mapExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {mapExpanded && (
                  <div className="p-4">
                    <LocationMap
                      userLocation={agentLocation}
                      zoom={15}
                      height="400px"
                      customIcon={bikeIcon}
                    />
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium flex items-center">
                        <Bike className="w-4 h-4 mr-2" />
                        {socket ? "Real-time updates active" : "Waiting for agent location..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Status Timeline */}
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
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${
                        isCancelled
                          ? "bg-red-100 text-red-800"
                          : order.status.toLowerCase() === "pending_confirmation"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                {isCancelled && order.cancellationReason && (
                  <div className="flex items-start mt-3 pt-3 border-t border-gray-100">
                    <XCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cancellation reason</p>
                      <p className="text-sm text-gray-600 mt-0.5">{order.cancellationReason}</p>
                    </div>
                  </div>
                )}
                {showCancelButton && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
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
                    {delivery?.deliveryAddress || `Address ID: ${order.deliveryAddressId}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for cancellation (at least 5 characters). This cannot be
              undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind / Wrong address / Found better price"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 resize-none"
              disabled={cancelSubmitting}
            />
            {cancelReason.trim().length > 0 && cancelReason.trim().length < 5 && (
              <p className="text-xs text-amber-600 mt-1">Reason must be at least 5 characters</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (!cancelSubmitting) {
                    setCancelModalOpen(false);
                    setCancelReason("");
                  }
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={cancelSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={!cancelReasonValid || cancelSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelSubmitting ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
