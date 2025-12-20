'use client'
import {FormEvent} from "react";
import {FormLevel} from "@/app/(public)/forgot_password/page";
import {useRouter} from "next/navigation";
import useApi from "@/hooks/useApi";

type FormLevelProps = {
    setFormLevel: (arg: FormLevel) => void,
    formLevel: FormLevel
}

export function SendVerification(props: FormLevelProps) {
    const api = useApi();
    const {formLevel, setFormLevel} = props;
    const sendVerificationEmail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await api.post("/api/auth/sendresettoken", Object.fromEntries(formData.entries()),
            {
                auth: "public"
            })

        const data = await res.json();

        if (data.error) {
            setFormLevel({...formLevel, error: data.error.split("_").join(" ")})
            return
        }
        setFormLevel({...formLevel, error: undefined, name: "verify", data: {email: formData.get("email") as string}})
    }
    return <form className="flex flex-col space-y-4 text-gray-800" onSubmit={sendVerificationEmail}>
        <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
        />

        {formLevel.error ? (
            <div className="w-full p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300">
                {formLevel.error}
            </div>
        ) : null}
        <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
        >
            Send Verification
        </button>
    </form>
}

export function VerifyPasswordToken(props: FormLevelProps) {
    const api = useApi()
    const {formLevel, setFormLevel} = props;
    const verifyToken = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const res = await api.post("/api/auth/verifyresettoken", Object.fromEntries(formData.entries()),
            {
                auth: "public"
            })

        const data = await res.json();

        if (data.error) {
            setFormLevel({...formLevel, error: data.error.split("_").join(" ")})
            return
        }
        setFormLevel({...formLevel, error: undefined, name: "set"})
    }

    return <form className="flex flex-col space-y-4 text-gray-800" onSubmit={verifyToken}>
        <input
            type="text"
            minLength={8}
            maxLength={8}
            name="resetToken"
            placeholder="Verification Token..."
            className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
        />

        {formLevel.error ? (
            <div className="w-full p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300">
                {formLevel.error}
            </div>
        ) : null}
        <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
        >
            Verify
        </button>
    </form>
}

export function ResetPassword(props: FormLevelProps) {
    const api = useApi();
    const router = useRouter();
    const {formLevel, setFormLevel} = props;
    const verifyToken = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (formData.get("newPassword") !== formData.get("confirmPwd")) {
            setFormLevel({...formLevel, error: "Passwords dont match"})
            return
        }
        const res = await api.post("/api/auth/resetpassword", Object.fromEntries(formData.entries()),
            {
                auth: "public"
            })

        const data = await res.json();

        if (data.error) {
            setFormLevel({...formLevel, error: data.error.split("_").join(" ")})
            return
        }
        setFormLevel({...formLevel, error: undefined, name: "set"})

        setTimeout(() => router.push("/login"), 500)
    }

    return <form className="flex flex-col space-y-4 text-gray-800" onSubmit={verifyToken}>
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
            placeholder="Reenter password..."
            className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
        />

        {formLevel.error ? (
            <div className="w-full p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300">
                {formLevel.error}
            </div>
        ) : null}
        <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
        >
            Reset
        </button>
    </form>
}