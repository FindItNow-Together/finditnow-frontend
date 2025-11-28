"use client"
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";

export default function UserHome() {
    const {logout} = useAuth();
    const route = useRouter();

    const handleLogout = () => {
        logout(() => route.push("/"))
    }

    return <div>
        <nav className="text-2xl">
            <div className="hover:animate-pulse">
                <span className="text-blue-500">Findit</span>
                <span className="text-green-500">Now</span>
            </div>
        </nav>
        <button onClick={handleLogout}>Logout</button>
    </div>
}