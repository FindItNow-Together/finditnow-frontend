"use client";
import { CreditCard, MapPin, ShoppingBag } from "lucide-react";

export default function OverviewSection() {
  return (
    <section className="space-y-4">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "Total Orders",
              value: "24",
              change: "+12%",
              icon: ShoppingBag,
              color: "blue",
            },
            { label: "Saved Cards", value: "3", icon: CreditCard, color: "purple" },
            { label: "Addresses", value: "2", change: "+1", icon: MapPin, color: "emerald" },
          ].map(({ label, value, change, icon: Icon, color }, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <Icon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-600 mt-1">{label}</p>
                  {change && (
                    <p
                      className={`text-sm font-medium mt-1 ${
                        color === "emerald"
                          ? "text-emerald-600"
                          : color === "blue"
                            ? "text-blue-600"
                            : "text-purple-600"
                      }`}
                    >
                      {change}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
