"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Loader2, Truck } from "lucide-react";
import useApi from "@/hooks/useApi";
import { DeliveryResponse, PagedDeliveryResponse } from "@/types/delivery";
import { toast } from "sonner";
import { useWebSocket } from "@/contexts/WebSocketContext";

const statusColors: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-800",
  PENDING_ACCEPTANCE: "bg-orange-100 text-orange-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-yellow-100 text-yellow-800",
  IN_TRANSIT: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED_BY_AGENT: "bg-red-100 text-red-800",
  UNASSIGNED: "bg-gray-100 text-gray-800",
};

type AgentStatus = "OFFLINE" | "AVAILABLE" | "ASSIGNED" | "SUSPENDED";

const allowedStatusTransitions: Record<AgentStatus, AgentStatus[]> = {
  OFFLINE: ["AVAILABLE"],
  AVAILABLE: ["OFFLINE"],
  ASSIGNED: ["AVAILABLE"],
  SUSPENDED: [],
};

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PAST">("ACTIVE");
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  const { deliveryApi, get, put } = useApi();

  const { socket, connect, disconnect } = useWebSocket(); // 2. Destructure WS
  const watchIdRef = useRef<number | null>(null);

  // Logic to handle Geo-broadcasting via WebSocket
  useEffect(() => {
    // Find if there is any delivery currently in progress
    const activeJob = deliveries.find((d) =>
      ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(d.status)
    );

    if (activeJob) {
      // Connect to WS for this specific order
      connect(activeJob.orderId);

      // Start watching location
      if ("geolocation" in navigator && !watchIdRef.current) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (socket?.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "LOCATION_UPDATE",
                  orderId: activeJob.orderId,
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                })
              );
              console.log("Location sent for order:", activeJob.orderId);
            }
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }
    } else {
      // Cleanup if no active job exists
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      disconnect();
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [deliveries, socket]);

  const format = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchStatus = async () => {
    const res = await get("/api/delivery-agent/my-status", { auth: "private" });

    const status = await res.json();

    setAgentStatus(status);
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // For now fetching all, but ideally we fetch based on status/tab
      // The backend supports status filtering.
      // ACTIVE = ASSIGNED, PICKED_UP
      // PAST = DELIVERED, CANCELLED
      // Since fetching multiple statuses might need multiple calls or backend change,
      // fetch everything and filter client-side for now, or just fetch page 0.

      const response = (await deliveryApi.getMyDeliveries(
        undefined,
        0,
        50
      )) as PagedDeliveryResponse;
      setDeliveries(response.deliveries || []);
    } catch (err) {
      console.error("Failed to fetch deliveries", err);
      // setError("Failed to load deliveries");
      // Fallback to empty for now to avoid breaking UI if backend is down
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAgentStatus = async (nextStatus: AgentStatus) => {
    try {
      await put("/api/delivery-agent/my-status", { status: nextStatus }, { auth: "private" });
      setAgentStatus(nextStatus);
    } catch (e) {
      console.error("Failed to update agent status", e);
    }
  };

  useEffect(() => {
    const run = async () => {
      const res = await get("/api/delivery-agent/my-status", { auth: "private" });
      const status = await res.json();
      setAgentStatus(status);
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const response = (await deliveryApi.getMyDeliveries(
          undefined,
          0,
          50
        )) as PagedDeliveryResponse;

        setDeliveries(response.deliveries || []);
      } catch (err) {
        console.error("Failed to fetch deliveries", err);
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const activeDeliveries = deliveries.filter(
    (d) =>
      d.status === "PENDING_ACCEPTANCE" ||
      d.status === "ASSIGNED" ||
      d.status === "PICKED_UP" ||
      d.status === "IN_TRANSIT"
  );
  const pastDeliveries = deliveries.filter(
    (d) =>
      d.status === "DELIVERED" ||
      d.status === "CANCELLED" ||
      d.status === "CANCELLED_BY_AGENT" ||
      d.status === "FAILED"
  );

  const displayedDeliveries = activeTab === "ACTIVE" ? activeDeliveries : pastDeliveries;

  const handleComplete = async (deliveryId: string) => {
    if (!confirm("Mark this delivery as completed?")) return;

    try {
      setActionLoading(deliveryId);
      await deliveryApi.complete(deliveryId);
      await fetchDeliveries(); // Refresh the list
      alert("Delivery completed successfully!");
    } catch (err) {
      console.error("Failed to complete delivery", err);
      alert("Failed to complete delivery. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (deliveryId: string) => {
    if (!confirm("Are you sure you want to cancel this delivery?")) return;

    try {
      setActionLoading(deliveryId);
      await deliveryApi.cancel(deliveryId);
      await fetchDeliveries();
      alert("Delivery cancelled successfully!");
    } catch (err) {
      console.error("Failed to cancel delivery", err);
      alert("Failed to cancel delivery. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOptOut = async (deliveryId: string) => {
    if (!confirm("Opt out of this delivery? It will be made available to other agents.")) return;

    try {
      setActionLoading(deliveryId);
      await deliveryApi.optOut(deliveryId);
      await fetchDeliveries();
      alert("Successfully opted out of delivery!");
    } catch (err) {
      console.error("Failed to opt out", err);
      alert("Failed to opt out. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (deliveryId: string) => {
    try {
      setActionLoading(deliveryId);
      await deliveryApi.accept(deliveryId);
      await fetchDeliveries(); // This updates the 'deliveries' state, triggering the useEffect above
      toast.success("Delivery accepted! Live tracking started.");
    } catch (err) {
      console.error("Failed to accept delivery", err);
      toast.error("Failed to accept delivery. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const canShowActions = (status: string) => {
    return ![
      "DELIVERED",
      "CANCELLED",
      "CANCELLED_BY_AGENT",
      "FAILED",
      "UNASSIGNED",
      "CREATED",
    ].includes(status);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-500">Manage your active and past deliveries</p>
        </header>

        {agentStatus && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-2">Your current status</p>

            <div className="flex flex-wrap gap-2">
              {(["OFFLINE", "AVAILABLE", "ASSIGNED", "SUSPENDED"] as AgentStatus[]).map(
                (status) => {
                  const isCurrent = status === agentStatus;
                  const canSelect = allowedStatusTransitions[agentStatus].includes(status);

                  return (
                    <button
                      key={status}
                      disabled={!canSelect}
                      onClick={() => updateAgentStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : canSelect
                      ? "bg-gray-100 hover:bg-blue-50 text-gray-800"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
                    >
                      {status}
                    </button>
                  );
                }
              )}
            </div>

            {agentStatus === "SUSPENDED" && (
              <p className="text-xs text-red-600 mt-3">
                Your account is suspended. Status changes are disabled.
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "ACTIVE"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Active
            <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {activeDeliveries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("PAST")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "PAST"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Past
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : displayedDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No deliveries found</h3>
              <p className="text-gray-500">
                {activeTab === "ACTIVE"
                  ? "You have no active deliveries right now."
                  : "You haven't completed any deliveries yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayedDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="p-5">
                    {/* Header: ID, Date, Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            #{delivery.orderId.substring(0, 8)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[delivery.status] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {delivery.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {delivery.createdAt && format(delivery.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{delivery.deliveryCharge}
                        </div>
                        <div className="text-xs text-gray-500">Earnings</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Locations */}
                    <div className="space-y-4 relative">
                      {/* Connecting Line */}
                      <div className="absolute left-1.5 top-2 bottom-8 w-0.5 bg-gray-200 -z-10"></div>

                      {/* Pickup */}
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                            Pickup
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {delivery.pickupAddress}
                          </p>
                        </div>
                      </div>

                      {/* Drop */}
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-green-100 border-2 border-green-600"></div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                            Drop off
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {delivery.deliveryAddress}
                          </p>
                          {/* Instructions if present */}
                          {delivery.instructions && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Note: {delivery.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  {canShowActions(delivery.status) ? (
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {/* Accept button - only for PENDING_ACCEPTANCE */}
                        {delivery.status === "PENDING_ACCEPTANCE" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(delivery.id);
                            }}
                            disabled={actionLoading === delivery.id}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {actionLoading === delivery.id ? "Processing..." : "Accept"}
                          </button>
                        )}
                        {/* Complete button - only for ASSIGNED, PICKED_UP, IN_TRANSIT */}
                        {(delivery.status === "ASSIGNED" ||
                          delivery.status === "PICKED_UP" ||
                          delivery.status === "IN_TRANSIT") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(delivery.id);
                            }}
                            disabled={actionLoading === delivery.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {actionLoading === delivery.id ? "Processing..." : "Complete"}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(delivery.id);
                          }}
                          disabled={actionLoading === delivery.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {actionLoading === delivery.id ? "Processing..." : "Cancel"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOptOut(delivery.id);
                          }}
                          disabled={actionLoading === delivery.id}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {actionLoading === delivery.id ? "Processing..." : "Opt Out"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        Status: {delivery.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
