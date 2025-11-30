'use client'
import Image from "next/image"
import {FormEvent, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";
import useApi from "@/hooks/useApi";

function Login() {
    const [error, setError] = useState("");
    const router = useRouter();
    const {setAccessToken} = useAuth();
    const api = useApi();

    const login = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);

        api.post("/api/signin", Object.fromEntries(data.entries()), {auth: "public"})
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    if (data.error == "account_not_verified") {
                        router.push("/verify_otp/" + data.credId)
                        return;
                    }
                    setError((data.error as string).split("_").join(" "))
                    return;
                }
                setAccessToken(data.accessToken)
                router.push("/home")
            })
            .catch(err => alert(err))

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
            <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl flex flex-col space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-800">FindItNow</h1>
                </div>

                <form className="flex flex-col space-y-4 text-gray-800" onSubmit={login}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        required
                    />

                    <div className="flex justify-end">
                        <a
                            href="/forgot_password"
                            className="text-sm text-gray-600 hover:text-black hover:underline transition"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {error ? (
                        <div className="w-full p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300">
                            {error}
                        </div>
                    ) : null}
                    <button
                        type="submit"
                        className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition"
                    >
                        Login
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-300"></div>
                    <span className="px-3 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow h-px bg-gray-300"></div>
                </div>

                <button
                    className="w-full py-3 flex items-center justify-center gap-3 border border-gray-300 rounded-md hover:bg-gray-100 transition">
                    <Image
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google icon"
                        width={20}
                        height={20}
                    />
                    <span className="text-gray-700 font-medium">Login with Google</span>
                </button>

                <div className="text-center text-sm text-gray-600">
                    Don’t have an account?
                    <a className="text-black font-medium ml-2 cursor-pointer hover:underline" href="/sign_up">
                        Sign up
                    </a>
                </div>
            </div>
        </div>


    )
}

export default Login;