"use client";
import Modal from "@/app/_components/Modal";
import LocationMap from "@/app/_components/Map/Map";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { UserAddress } from "@/types/user";
import useApi from "@/hooks/useApi";

type AddressType = "HOME" | "OFFICE" | "OTHER";

type AddressForm = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  latitude: number;
  addressType: AddressType;
  longitude: number;
  isLocationSet: boolean;
};

const emptyForm: AddressForm = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  latitude: 51.505 as number, // Default fallback
  longitude: -0.09 as number,
  addressType: "HOME",
  isPrimary: false,
  isLocationSet: false,
};
type CreateAddressModalParam = {
  showModal: string | null | undefined;
  setShowModal: Dispatch<SetStateAction<string | null | undefined>>;
  setAddresses: Dispatch<SetStateAction<UserAddress[]>>;
  onSuccess?: (address: UserAddress) => void;
};

export default function CreateAddressModal({
  showModal,
  setShowModal,
  setAddresses,
  onSuccess,
}: CreateAddressModalParam) {
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const api = useApi();

  const extractErrors = async (res: Response): Promise<string[]> => {
    try {
      const body = await res.json();

      if (Array.isArray(body?.errors)) return body.errors;
      if (typeof body?.errors === "object") return Object.values(body.errors);
      if (body?.message) return [body.message];

      return ["Something went wrong"];
    } catch {
      return ["Unexpected server error"];
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);

    try {
      setLoading(true);

      const res = await api.post("/api/user/addresses/add", form, { auth: "private" });

      if (!res.ok) {
        const extracted = await extractErrors(res);
        setErrors(extracted);
        return;
      }

      const json = await res.json();
      setAddresses((prev) => [...prev, json.data]);
      onSuccess?.(json.data);
      setShowModal(null);
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationOnMap = (lat: number, long: number) => {
    setForm({ ...form, latitude: lat, longitude: long });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const isAddDisabled = !form.isLocationSet || loading;

  useEffect(() => {
    if (!showModal) {
      setForm(emptyForm);
      setErrors([]);
    }
  }, [showModal]);

  return (
    <>
      {showModal === "Address" && (
        <Modal header="Add new address" onCloseAction={() => setShowModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Error Box */}
            {errors.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm space-y-1">
                {errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <textarea
              className={inputClass}
              rows={2}
              placeholder="Apartment / Building"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />

            <textarea
              className={inputClass}
              rows={2}
              placeholder="Landmark (optional)"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />

            <input
              className={inputClass}
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <input
              className={inputClass}
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />

            <input
              className={inputClass}
              placeholder="Pincode"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />

            <input
              className={inputClass}
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />

            <div className="flex bg-gray-100 p-1 rounded-lg">
              {["HOME", "OFFICE", "OTHER"].map((addrType) => (
                <label
                  key={addrType}
                  className={`flex-1 text-center py-2 text-[10px] font-bold uppercase cursor-pointer rounded-md transition-all ${
                    form.addressType === addrType
                      ? "bg-white shadow-sm text-black"
                      : "text-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={addrType}
                    className="hidden"
                    onChange={(e) =>
                      setForm({ ...form, addressType: e.target.value as AddressType })
                    }
                    checked={addrType === form.addressType}
                  />
                  {addrType.replace("_", " ")}
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                className="rounded border-gray-300"
              />
              Set as default address
            </label>

            <button
              onClick={() => setShowModal("Map")}
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select location
            </button>

            <button
              disabled={isAddDisabled}
              type={"submit"}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : "Add Address"}
            </button>
          </form>
        </Modal>
      )}

      {showModal === "Map" && (
        <Modal
          header={"Select location for accuracy"}
          onCloseAction={() => setShowModal("Address")}
        >
          <LocationMap
            height="400px"
            userLocation={{ lat: form.latitude, lng: form.longitude }}
            onMapClick={handleLocationOnMap}
          />

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => {
                setForm({ ...form, isLocationSet: true });
                setShowModal("Address");
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Confirm Location
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
