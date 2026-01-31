"use client";
import { FormEvent } from "react";
import { FormLevel } from "@/app/(public)/forgot_password/page";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";

type FormLevelProps = {
  setFormLevel: (arg: FormLevel) => void;
  formLevel: FormLevel;
};

export function SendVerification({ formLevel, setFormLevel }: FormLevelProps) {
  const api = useApi();

  const sendVerificationEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await api.post(
        "/api/auth/sendresettoken",
        Object.fromEntries(formData.entries()),
        { auth: "public" }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server error. Please try again later.");
      }

      if (data.error) {
        toast.error(data.error.split("_").join(" "));
        return;
      }

      toast.success("Verification code sent to your email");
      setFormLevel({
        name: "verify",
        data: { email: formData.get("email") as string },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <form className="flex flex-col space-y-4 text-gray-800" onSubmit={sendVerificationEmail}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        required
      />

      <button
        type="submit"
        className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
      >
        Send Verification
      </button>
    </form>
  );
}

export function VerifyPasswordToken({ formLevel, setFormLevel }: FormLevelProps) {
  const api = useApi();

  const verifyToken = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await api.post(
        "/api/auth/verifyresettoken",
        Object.fromEntries(formData.entries()),
        { auth: "public" }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response.");
      }

      if (data.error) {
        toast.error(data.error.split("_").join(" "));
        return;
      }

      toast.success("Token verified. You can now reset your password.");
      setFormLevel({ name: "set", data: formLevel.data });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Verification failed. Please try again."
      );
    }
  };

  return (
    <form className="flex flex-col space-y-4 text-gray-800" onSubmit={verifyToken}>
      <input
        type="text"
        minLength={8}
        maxLength={8}
        name="resetToken"
        placeholder="Verification Token..."
        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        required
      />

      <button
        type="submit"
        className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
      >
        Verify
      </button>
    </form>
  );
}

export function ResetPassword({ formLevel, setFormLevel }: FormLevelProps) {
  const api = useApi();
  const router = useRouter();

  const resetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (formData.get("newPassword") !== formData.get("confirmPwd")) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await api.post(
        "/api/auth/resetpassword",
        Object.fromEntries(formData.entries()),
        { auth: "public" }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server error. Please try again later.");
      }

      if (data.error) {
        toast.error(data.error.split("_").join(" "));
        return;
      }

      toast.success("Password reset successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Reset failed. Please try again."
      );
    }
  };

  return (
    <form className="flex flex-col space-y-4 text-gray-800" onSubmit={resetPassword}>
      <input
        type="password"
        name="newPassword"
        placeholder="Password..."
        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        required
      />

      <input
        type="password"
        name="confirmPwd"
        placeholder="Re-enter password..."
        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        required
      />

      <button
        type="submit"
        className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
      >
        Reset
      </button>
    </form>
  );
}
