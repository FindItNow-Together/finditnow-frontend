'use client'
import {useState} from "react";
import {ResetPassword, SendVerification, VerifyPasswordToken} from "@/app/forgot_password/FormLevelComponents";

export type FormLevel = {
    name: string,
    data?: object,
    error?: string
}

const formDefaultLevel: FormLevel = {name: "send"}

export default function ForgotPassword() {
    const [formLevel, setFormLevel] = useState(formDefaultLevel);

    const getFormLevelComponent = (level: FormLevel) => {
        switch (level.name) {
            case "send":
                return <SendVerification setFormLevel={setFormLevel}
                                         formLevel={formLevel}/>
            case "verify":
                return <VerifyPasswordToken setFormLevel={setFormLevel}

                                            formLevel={formLevel}/>
            case "set":
                return <ResetPassword setFormLevel={setFormLevel} formLevel={formLevel}/>
            default :
                return null
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
            <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl flex flex-col space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-800">FindItNow</h1>
                </div>

                {getFormLevelComponent(formLevel)}
            </div>
        </div>
    )
}