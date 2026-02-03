"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { UserAddress } from "@/types/user";
import { Edit3, Loader2, MapPin, Plus } from "lucide-react";
import Modal from "@/app/_components/Modal";
import CreateAddressModal from "@/app/_components/CreateAddressModal";
import { Cart } from "@/types/cart";

type Pricing = {
  distanceKm: number;
  deliveryFee: number;
  tax: number;
  payable: number;
};

type DeliveryETA = {
  etaText: string;
  confidence: "low" | "medium" | "high";
};

type PageStatus = "LOADING" | "READY" | "ORDER_CREATING" | "PAYMENT_INITIATING" | "ERROR";

export default function CheckoutClient({ cartId }: { cartId: string }) {
  const router = useRouter();
  const api = useApi();
  const { isAuthenticated, userData } = useAuth();
  const { cart, setCart, clearCart } = useCart();

  const [checkoutCart, setCheckoutCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [initialAddressId, setInitialAddressId] = useState<string | null>(null); // Track initial address
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [eta, setEta] = useState<DeliveryETA | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash_on_delivery">("online");
  const [deliveryType, setDeliveryType] = useState<"PARTNER" | "TAKEAWAY">("PARTNER");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState<PageStatus>("LOADING");
  const [error, setError] = useState<string | null>(null);

  const [showAddressSelectModal, setShowAddressSelectModal] = useState(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState<string | null>();

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressSelectModal(false);
  };

  const handleNewAddress = (newAddress: UserAddress) => {
    setSelectedAddressId(newAddress.id);
    setShowNewAddressModal(null);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!cart) {
      setStatus("LOADING");
      return;
    }

    if (cart && cart.cartId === cartId) {
      setCheckoutCart(cart);
      setStatus("READY");
      return;
    }

    api
      .get(`/api/cart/user/me`, { auth: "private" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Invalid cart");
        const data = await res.json();
        setCart(data);
        setCheckoutCart(data);
        setStatus("READY");
      })
      .catch(() => {
        clearCart();
        router.replace("/cart");
      });
  }, [cartId, cart?.cartId]);

  // Load initial pricing with delivery fee for primary address
  useEffect(() => {
    if (!checkoutCart) return;

    api
      .get(`/api/cart/${checkoutCart.cartId}/pricing`, { auth: "private" })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid cart");
        return res.json();
      })
      .then((data: Pricing) => {
        setPricing(data);
        // Set ETA from initial pricing
        if (data.distanceKm) {
          setEta({ etaText: `${data.distanceKm} km`, confidence: "medium" });
        }
      })
      .catch((err) => {
        console.log(err.message);
        setPricing({ distanceKm: 0, deliveryFee: 100, payable: 1100, tax: 1000 });
      });
  }, [checkoutCart]);

  useEffect(() => {
    if (userData?.addresses) {
      setAddresses(userData.addresses);
      const primary = userData.addresses.find((a) => a.isPrimary);
      if (primary) {
        setSelectedAddressId(primary.id);
        setInitialAddressId(primary.id); // Track the initial primary address
      }
    }
  }, [userData]);

  // Only call quote API when address changes (not on initial load)
  useEffect(() => {
    // Don't call if no address selected or if it's the initial address
    if (!checkoutCart || !selectedAddressId || selectedAddressId === initialAddressId) return;

    if (deliveryType === "TAKEAWAY") {
      setPricing((prev) =>
        prev ? { ...prev, deliveryFee: 0, payable: prev.payable - prev.deliveryFee } : null
      );
      setEta(null);
      return;
    }

    // Reset ETA and start loading
    setEta(null);
    setIsLoadingQuote(true);

    // Fetch Delivery Quote for new address
    api
      .get(`/api/orders/quote?shopId=${checkoutCart.shopId}&addressId=${selectedAddressId}`, {
        auth: "private",
      })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const newFee = data.amount;
          const distanceKm = data.distanceKm;
          setPricing((prev) =>
            prev
              ? {
                  ...prev,
                  distanceKm: distanceKm,
                  deliveryFee: newFee,
                  payable: prev.payable - prev.deliveryFee + newFee,
                }
              : null
          );
          setEta({ etaText: `${distanceKm} km`, confidence: "medium" });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch quote:", err);
      })
      .finally(() => {
        setIsLoadingQuote(false);
      });
  }, [selectedAddressId, deliveryType, checkoutCart?.shopId, initialAddressId]);

  // Handle delivery type change
  useEffect(() => {
    if (!pricing) return;

    if (deliveryType === "TAKEAWAY") {
      setPricing((prev) =>
        prev ? { ...prev, deliveryFee: 0, payable: prev.payable - prev.deliveryFee } : null
      );
      setEta(null);
    } else if (deliveryType === "PARTNER" && pricing.deliveryFee === 0) {
      // If switching back to PARTNER from TAKEAWAY, we may need to refetch
      // This will be handled by the address change effect if needed
    }
  }, [deliveryType]);

  const canPlaceOrder = useMemo(() => {
    return status === "READY" && checkoutCart && pricing && selectedAddressId !== null;
  }, [status, checkoutCart, pricing, selectedAddressId]);

  async function placeOrder() {
    if (!canPlaceOrder || !checkoutCart) return;

    try {
      setStatus("ORDER_CREATING");

      const orderRes = await api.post(
        "/api/orders/from-cart",
        {
          cartId: checkoutCart.cartId,
          addressId: selectedAddressId,
          paymentMethod,
          deliveryType,
          instructions,
        },
        { auth: "private" }
      );

      if (!orderRes.ok) throw new Error("Order creation failed");

      const order = await orderRes.json();
      clearCart();

      if (paymentMethod === "cash_on_delivery") {
        router.replace(`/orders/${order.id}`);
        return;
      }

      setStatus("PAYMENT_INITIATING");

      const payRes = await api.post(
        "/api/payments/initiate",
        { orderId: order.id },
        { auth: "private" }
      );

      const payment = await payRes.json();
      openRazorpay(payment, order.id);
    } catch (e: any) {
      setError(e.message ?? "Checkout failed");
      setStatus("ERROR");
    }
  }

  function openRazorpay(payment: any, orderId: string) {
    const rzp = new (window as any).Razorpay({
      key: payment.razorpayKey,
      amount: payment.amount,
      order_id: payment.razorpayOrderId,
      handler: async function (response: any) {
        console.log("Payment successful, verifying...", response);
        await handlePaymentCallback(response, orderId);
      },
      modal: {
        ondismiss: function () {
          console.log("Payment cancelled by user");
          setStatus("ERROR");
          setError("Payment cancelled. Please try again.");
        },
      },
      theme: {
        color: "#3B82F6",
      },
    });

    rzp.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      setStatus("ERROR");
      setError(response.error.description || "Payment failed. Please try again.");
    });

    rzp.open();
  }

  async function handlePaymentCallback(response: any, orderId: string) {
    try {
      const callbackRes = await api.post(
        "/api/payments/callback",
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
        { auth: "private" }
      );

      if (!callbackRes.ok) {
        const errorData = await callbackRes.json();
        throw new Error(errorData.error || "Payment verification failed");
      }

      const callbackData = await callbackRes.json();

      if (callbackData.status === "success") {
        router.replace(`/orders/${orderId}`);
      } else {
        throw new Error(callbackData.error || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment callback error:", error);
      setStatus("ERROR");
      setError(
        error.message ||
          "Failed to verify payment. Please contact support with order ID: " + orderId
      );
    }
  }

  if (status === "LOADING") return <div className="p-6">Loading checkout…</div>;
  if (status === "ERROR") return <div className="p-6 text-red-600">{error}</div>;
  if (!checkoutCart || !pricing) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ADDRESS */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
          <button
            onClick={() => setShowAddressSelectModal(true)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Change
          </button>
        </div>

        {selectedAddress ? (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">{selectedAddress.fullAddress}</p>
              {selectedAddress.isPrimary && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                  Default
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No address selected</div>
        )}

        {/* ETA with Loading State */}
        {deliveryType === "PARTNER" && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {isLoadingQuote ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating delivery...</span>
              </div>
            ) : eta ? (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Estimated delivery:</span> {eta.etaText}
              </p>
            ) : null}
          </div>
        )}
      </section>

      {/* DELIVERY OPTIONS */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h2>

        <div className="space-y-3 mb-4">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="deliveryType"
              checked={deliveryType === "PARTNER"}
              onChange={() => setDeliveryType("PARTNER")}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium">Standard Delivery</span>
              <p className="text-sm text-gray-500">Delivered by our partner</p>
            </div>
          </label>

          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="deliveryType"
              checked={deliveryType === "TAKEAWAY"}
              onChange={() => setDeliveryType("TAKEAWAY")}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium">Self Pickup (Takeaway)</span>
              <p className="text-sm text-gray-500">Pick up from store</p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Where should we leave the package?"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={2}
          />
        </div>
      </section>

      {/* CART */}
      <section>
        <h2 className="font-semibold mb-2">Order Summary</h2>
        {checkoutCart.items.map((i) => (
          <div key={i.itemId} className="flex justify-between text-sm">
            <span>
              {i.productName} × {i.quantity}
            </span>
            <span>₹{i.price * i.quantity}</span>
          </div>
        ))}
      </section>

      {/* TOTAL with Loading State */}
      <section className="border-t pt-3">
        <div className="flex justify-between font-semibold">
          <span>Delivery Fee</span>
          {isLoadingQuote ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>{pricing.deliveryFee > 0 ? `₹${pricing.deliveryFee}` : "Free"}</span>
          )}
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          {isLoadingQuote ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>₹{pricing?.payable}</span>
          )}
        </div>
      </section>

      {/* PAYMENT */}
      <section>
        <label className="block">
          <input
            type="radio"
            checked={paymentMethod === "online"}
            onChange={() => setPaymentMethod("online")}
            className="mr-2"
          />
          Pay Online
        </label>
        <label className="block">
          <input
            type="radio"
            checked={paymentMethod === "cash_on_delivery"}
            onChange={() => setPaymentMethod("cash_on_delivery")}
            className="mr-2"
          />
          Cash on Delivery
        </label>
      </section>

      <button
        disabled={!canPlaceOrder || isLoadingQuote}
        onClick={placeOrder}
        className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50"
      >
        {paymentMethod === "online" ? `Pay ₹${pricing?.payable} & Place Order` : "Place Order"}
      </button>

      {showAddressSelectModal && (
        <Modal
          header="Select Delivery Address"
          onCloseAction={() => setShowAddressSelectModal(false)}
        >
          <div className="space-y-3">
            {addresses.map((address) => (
              <button
                key={address.id}
                onClick={() => handleAddressSelect(address.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedAddressId === address.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      selectedAddressId === address.id ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{address.fullAddress}</p>
                    {address.isPrimary && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                setShowAddressSelectModal(false);
                setShowNewAddressModal("Address");
              }}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium text-sm">Add New Address</span>
            </button>
          </div>
        </Modal>
      )}

      <CreateAddressModal
        showModal={showNewAddressModal}
        setShowModal={setShowNewAddressModal}
        setAddresses={setAddresses}
        onSuccess={handleNewAddress}
      />
    </div>
  );
}
