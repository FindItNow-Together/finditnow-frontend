"use client"
import {useAuth} from "@/app/_auth_context/AuthContext";
import {useRouter} from "next/navigation";

export default function UserHome() {
    const {accessToken, logout} = useAuth();
    const route = useRouter();

    if (accessToken == null || accessToken.length == 0) {
        route.push("/login")
        return
    }

    const handleLogout = () => {
        logout(() => route.push("/"))
    }

    return <div>
        <div>Logged In</div>
        <button onClick={handleLogout}>Logout</button>
    </div>
}