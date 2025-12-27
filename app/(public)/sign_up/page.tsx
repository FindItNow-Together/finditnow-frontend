"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";

function SignUp() {
  const api = useApi();
  const [error, setError] = useState("");
  const [isAdminPending, setIsAdminPending] = useState(false); // State for Admin view
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState();
  const router = useRouter();

  async function signUpUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.log("Payload   ", payload);
    try {
      const res = await api.post("/api/auth/signup", payload);
      const data = await res.json();

      if (data.error) {
        if (data.error === "account_not_verified") {
          router.push("/verify_otp/" + data.credId);
          return;
        }
        setError((data.error as string).split("_").join(" "));
        return;
      }

      // Check if the selected role was ADMIN
      if (payload.role === "ADMIN") {
        setIsAdminPending(true);
      } else {
        router.push(`/verify_otp/${data.credId}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // --- ADMIN PENDING COMPONENT ---
  if (isAdminPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 p-4">
        <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Registration Received</h2>
          <p className="text-gray-600">
            Admin accounts require manual approval. Please contact the system administrator to
            verify your credentials.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl flex flex-col space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800">FindItNow</h1>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        <form className="flex flex-col space-y-4 text-gray-800" onSubmit={signUpUser}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
          />

          {/* Role Selection */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["CUSTOMER", "SHOP_OWNER", "DELIVERY_AGENT", "ADMIN"].map((role) => (
              <label
                key={role}
                className={`flex-1 text-center py-2 text-[10px] font-bold uppercase cursor-pointer rounded-md transition-all ${
                  selectedRole === (role == "SHOP_OWNER" ? "shop" : role)
                    ? "bg-white shadow-sm text-black"
                    : "text-gray-500"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role == "SHOP_OWNER" ? "shop" : role}
                  className="hidden"
                  onChange={(e) => setSelectedRole(e.target.value)}
                  checked={selectedRole === (role == "SHOP_OWNER" ? "shop" : role)}
                />
                {role.replace("_", " ")}
              </label>
            ))}
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
          />

          {error && (
            <div className="w-full p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?
          <a className="text-black font-medium ml-2 cursor-pointer hover:underline" href={"/login"}>
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
