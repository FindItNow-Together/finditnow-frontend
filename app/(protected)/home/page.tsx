"use client"
import Map from "@/app/(protected)/home/Map";
import {useState} from "react";
import Navbar from "@/app/_components/Navbar";

export default function UserHome() {
    const [itemCount, setItemCount] = useState(0);

    return <div>

        <Navbar itemCount={itemCount}/>
        <div>
            <Map/>
        </div>
    </div>
}