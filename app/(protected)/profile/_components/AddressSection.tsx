"use client";
import Modal from "@/app/_components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { useState, useEffect, FormEvent } from "react";

type AddressForm = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
};

const emptyForm: AddressForm = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isPrimary: false,
};

export default function AddressesSection() {
  const { userData } = useAuth();
  const api = useApi();

  const [addresses, setAddresses] = useState(userData?.addresses || []);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showModal) {
      setForm(emptyForm);
      setErrors([]);
    }
  }, [showModal]);

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
      setShowModal(false);
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border">
        <h2 className="text-2xl font-bold">Addresses</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Add Address
        </button>
      </div>

      {/* Address Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="rounded-2xl p-6 bg-white dark:bg-gray-800 border">
            <p className="text-sm text-gray-700 dark:text-gray-300">{addr.fullAddress}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal header="Add new address" onCloseAction={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Error Box */}
            {errors.length > 0 && (
              <div className="rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm space-y-1">
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

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              />
              Set as default address
            </label>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 text-white py-2 font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Address"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
