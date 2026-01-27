"use client";

import LocationMap from "@/app/_components/Map";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterShopPage() {
  const router = useRouter();
  const { shopApi } = useApi();
  const { accessRole } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    latitude: 51.505 as number, // Default fallback
    longitude: -0.09 as number,
    openHours: "",
    deliveryOption: "PICKUP",
    ownerId: "",
  });

  // Automatically fetch initial location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })),
      (err) => console.error("Location access denied", err)
    );
  }, []);

  const handleMapSelection = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await shopApi.register(formData);
      if (accessRole == "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-white text-center">
          <h2 className="text-2xl font-bold">Register New Shop</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Shop Name</label>
            <input
              required
              className="w-full px-4 py-2 border rounded-lg mt-1"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                required
                className="w-full px-4 py-2 border rounded-lg mt-1"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Open Hours</label>
              <input
                required
                className="w-full px-4 py-2 border rounded-lg mt-1"
                type="text"
                placeholder="9 AM - 6 PM"
                value={formData.openHours}
                onChange={(e) => setFormData({ ...formData, openHours: e.target.value })}
              />
            </div>
          </div>

          {/* Location Picker Section */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-800">Location Coordinates</span>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
              >
                📍 Select on Map
              </button>
            </div>
            <div className="grid grid-cols-2 text-xs text-blue-700 font-mono">
              <div>Lat: {formData.latitude.toFixed(6)}</div>
              <div>Long: {formData.longitude.toFixed(6)}</div>
            </div>
          </div>

          {/* Other Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              className="w-full px-4 py-2 border rounded-lg mt-1"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Option</label>
            <select
              className="w-full px-4 py-2 border rounded-lg mt-1"
              value={formData.deliveryOption}
              onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value })}
            >
              <option value="PICKUP">Pickup Only</option>
              <option value="DELIVERY">Delivery Only</option>
              <option value="BOTH">Both</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Registering..." : "Register Shop"}
            </button>
          </div>
        </form>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Click on the map to set location</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <LocationMap
              height="400px"
              userLocation={{ lat: formData.latitude, lng: formData.longitude }}
              onMapClick={handleMapSelection}
            />

            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowMapModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
