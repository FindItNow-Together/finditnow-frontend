"use client";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import { FormEvent, useEffect, useState } from "react";
import CreateAddressModal from "@/app/_components/CreateAddressModal";

type AddressForm = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  latitude: number;
  addressType: "HOME" | "OFFICE" | "OTHER";
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

export default function AddressesSection() {
  const { userData } = useAuth();

  const [addresses, setAddresses] = useState(userData?.addresses || []);
  const [showModal, setShowModal] = useState<string | null>();

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-5 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
        <button
          onClick={() => setShowModal("Address")}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Add Address
        </button>
      </div>

      {/* Address Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="rounded-lg p-5 bg-white border border-gray-200">
            <p className="text-sm text-gray-600">{addr.fullAddress}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      <CreateAddressModal
        showModal={showModal}
        setShowModal={setShowModal}
        setAddresses={setAddresses}
      />
    </section>
  );
}
