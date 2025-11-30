'use client'
import {ShoppingCart} from "lucide-react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";

export default function Navbar(props: { itemCount: number }) {
    const router = useRouter();
    const {logout} = useAuth();
    const {itemCount} = props;

    const handleLogout = () => {
        logout(() => router.replace("/"))
    }
    return <nav className="text-2xl flex items-center text-center p-2 justify-between bg-gray-300
        rounded-b-md sticky top-0 shadow-md">
        <div className="hover:animate-pulse hover:cursor-default font-bold">
            <span className="text-blue-500">Findit</span>
            <span className="text-green-500">Now</span>
        </div>

        <button onClick={() => {
            router.push("/cart")
        }} className="flex items-center gap-2">
            <ShoppingCart/>
            {itemCount != 0 ? <span>{itemCount}</span> : null}
        </button>
        <button className="bg-red-500 text-white rounded-sm px-2 py-1 hover:bg-red-600 hover:shadow"
                onClick={handleLogout}>Logout
        </button>
    </nav>
}