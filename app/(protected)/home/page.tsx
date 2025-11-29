"use client"
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";
import Map from "@/app/(protected)/home/Map";

export default function UserHome() {
    const {logout} = useAuth();
    const route = useRouter();

    const handleLogout = () => {
        logout(() => route.push("/"))
    }

    return <div>
        <nav className="text-2xl flex items-center text-center p-2 justify-between bg-gray-300
        rounded-b-md sticky top-0 shadow-md">
            <div className="hover:animate-pulse hover:cursor-default font-bold">
                <span className="text-blue-500">Findit</span>
                <span className="text-green-500">Now</span>
            </div>
            <button className="bg-red-500 text-white rounded-sm px-2 py-1 hover:bg-red-600 hover:shadow"
                    onClick={handleLogout}>Logout
            </button>
        </nav>

        <div>
            <Map/>
        </div>
    </div>
}