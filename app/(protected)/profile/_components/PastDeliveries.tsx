"use client";
export default function PastDeliveriesSection() {
  return (
    <section>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Past Deliveries</h2>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Delivery ID
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3].map((d) => (
                <tr
                  key={d}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    DELV-{1000 + d}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    #ORD{d.toString().padStart(4, "0")}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    19 Dec 2025
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹250
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3].map((d) => (
            <div key={d} className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  DELV-{1000 + d}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹250</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Order #ORD{d.toString().padStart(4, "0")}</span>
                <span>19 Dec 2025</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
