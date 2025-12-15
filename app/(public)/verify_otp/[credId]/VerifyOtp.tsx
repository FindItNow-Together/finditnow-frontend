"use client"
import {useEffect, useRef, useState} from "react";
import {clearInterval, setInterval} from "node:timers";
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";
import useApi from "@/hooks/useApi";

let resendTimerInterval: NodeJS.Timeout | undefined;
export default function VerifyOtp({credId}: { credId: string }) {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(5);
    const [disableResend, setDisableResend] = useState(false);
    const {setAccessToken, setAccessRole} = useAuth();
    const router = useRouter();
    const api = useApi();

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

        const res = await api.post("/api/verifyemail", {credId, verificationCode: code})

        const data = await res.json();

        setAccessToken(data.accessToken);
        setAccessRole(data.profile as string)
        let route;

        switch (data.profile as string) {
            case "CUSTOMER":
                route = "/home"
                break;
            case "ADMIN":
                route = "/admin";
                break;
            case "SHOP":
                route = "/shop";
                break;
            case "DELIVERY":
                route = "/delivery";
                break;
            default:
                route = "/home";
        }
        router.push(route)
    };

    const resendVerificationEmail = async () => {
        setDisableResend(true);
        try {
            const res = await api.post("/api/resendverificationemail", {credId})

            if (!res.ok) {
                console.log("error in resend")
                return
            }
            setResendTimer(45);
        } catch (err) {
            console.log(err)
        }

        setDisableResend(false)
    }

    useEffect(() => {
        if (resendTimerInterval) {
            if (resendTimer == 0) {
                clearInterval(resendTimerInterval);

                resendTimerInterval = undefined;
            }
        } else {
            resendTimerInterval = setInterval(() => setResendTimer(prev => prev - 1), 1000)
        }

    }, [resendTimer])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-8 border border-gray-200">

                <h1 className="text-4xl font-semibold text-gray-900 text-center tracking-tight">
                    FindItNow
                </h1>

                <p className="text-center text-gray-600">
                    Enter the 6-digit verification code sent to your email
                </p>

                <div className="flex justify-between gap-3">
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
                            className="
                        w-12 h-14 border border-gray-300 rounded-lg
                        text-center text-2xl font-medium text-gray-800
                        focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                        transition-all
                    "
                        />
                    ))}
                </div>

                <button
                    onClick={verifyOtp}
                    disabled={digits.join("").length !== 6}
                    className="
                w-full py-3 rounded-lg font-medium
                bg-black text-white
                hover:bg-gray-900
                transition-all
                disabled:bg-gray-400 disabled:cursor-not-allowed
            "
                >
                    Verify
                </button>

                <div className="text-center text-gray-600">
                    Resend available in:
                    <span className="ml-2">
                {resendTimer === 0 ? (
                    <button
                        onClick={resendVerificationEmail}
                        disabled={disableResend}
                        className="
                            text-blue-600 hover:text-blue-700 hover:underline
                            disabled:text-gray-400 disabled:no-underline
                        "
                    >
                        Resend Email
                    </button>
                ) : (
                    <span className="font-medium">{resendTimer}s</span>
                )}
            </span>
                </div>

            </div>
        </div>

    );
}