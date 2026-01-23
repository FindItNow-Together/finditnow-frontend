export default function OrdersSection() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white rounded-lg p-5 border border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <p className="text-gray-600 text-sm mt-1">Your order history</p>
        </div>
        <input
          type="search"
          placeholder="Search orders..."
          className="w-full lg:w-72 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3].map((id) => (
                <tr key={id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    #ORD{id.toString().padStart(4, "0")}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">20 Dec 2025</td>
                  <td className="px-4 py-4 font-semibold text-gray-900">₹1,299</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Delivered
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
