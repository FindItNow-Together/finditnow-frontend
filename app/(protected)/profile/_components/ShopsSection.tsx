"use client";
export function ShopsSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Shops</h2>
        </div>
        <button className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          Add Shop
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((shop) => (
          <div
            key={shop}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Shop #{shop}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Brief shop description goes here.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200">
                Manage
              </button>
              <button className="flex-1 px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200">
                Disable
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
