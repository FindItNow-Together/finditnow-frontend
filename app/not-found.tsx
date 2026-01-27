import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="
        h-[calc(100dvh-4rem)]
        overflow-hidden
        grid place-items-center
        bg-gradient-to-br from-gray-50 to-gray-100
        px-4
      "
    >
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Symbol */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <span className="text-3xl font-extrabold text-blue-600">404</span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist, or the path has changed. Nothing is broken —
          you have simply reached an empty road.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-full
                       bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white
                       hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>

          <Link
            href="/discover"
            className="inline-flex justify-center rounded-full
                       border border-gray-300 px-5 py-2.5 text-sm font-medium
                       text-gray-700 hover:bg-gray-100 transition"
          >
            Discover
          </Link>
        </div>
      </div>
    </div>
  );
}
