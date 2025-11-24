'use client';

import {FormEvent} from "react";
import {useRouter} from "next/navigation";

function SignUp() {

    const router = useRouter();

    async function signUpUser(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const res = await fetch("/api/signup", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(formData.entries())),  // no JSON.stringify
            headers: {
                "Content-Type": "application/json"
            }
        })

        const data = await res.json()

        if((data.credId as string).length==0){
            console.log("ERROR: ", "IN SIGNUP")
            return
        }
        router.push(`/verify_otp/${data.credId}`);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
            <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl flex flex-col space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-800">FindItNow</h1>
                </div>

                <form className="flex flex-col space-y-4 text-gray-800" onSubmit={(e) => signUpUser(e)}>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name..."
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />

                    <button className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition">
                        Sign Up
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
    )
}

export default SignUp;