"use client"
import {useRef, useState} from "react";

export default function VerifyOtp({credId}: { credId: string }) {

    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const updated = [...digits];
        updated[index] = value;
        setDigits(updated);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && digits[index] === "" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const verifyOtp = async () => {
        const code = digits.join("");
        if (code.length !== 6) return;

        const res = await fetch("/api/verifyemail", {
            method: "POST",
            body: JSON.stringify({credId, verificationCode: code}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();
        console.log(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
            <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl flex flex-col space-y-8">

                <h1 className="text-3xl font-semibold text-gray-800 text-center">
                    FindItNow
                </h1>

                <div className="flex justify-between">
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            ref={(el) => {
                                inputsRef.current[i] = el;
                            }}
                            className="w-12 h-12 border border-gray-300 rounded-md text-center text-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800"
                        />
                    ))}
                </div>

                <button
                    onClick={verifyOtp}
                    className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-900 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={digits.join("").length !== 6}
                >
                    Verify
                </button>
            </div>
        </div>
    );
}