"use client";

import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-8 text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 text-3xl">
          ⛔
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Forbidden</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. If you believe this is a mistake, contact an
          administrator.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="w-full rounded-md border border-gray-300 px-4 py-2
                                   text-gray-700 hover:bg-gray-100 transition"
          >
            Go Back
          </button>

          <button
            onClick={() => router.replace("/")}
            className="w-full rounded-md bg-blue-600 px-4 py-2
                                   text-white hover:bg-blue-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
