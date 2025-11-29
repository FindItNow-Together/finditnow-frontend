'use client'
import {useEffect} from "react";

const pinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" 
     viewBox="0 0 24 24" fill="none" stroke="currentColor" 
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
  <circle cx="12" cy="10" r="3"/>
</svg>
`;
export default function Map() {
    useEffect(() => {
        async function loadLeaflet() {
            const L = await import("leaflet");
            const map = L.map("map").setView([19.0760, 72.8777], 12);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "© OpenStreetMap",
            }).addTo(map);

            const locations: {
                coords: L.LatLngTuple;
                title: string;
                desc: string;
            }[] = [
                {
                    coords: [19.082, 72.88],
                    title: "Sample Pin",
                    desc: "This is a custom card description"
                },
                {
                    coords: [19.05, 72.84],
                    title: "Another Location",
                    desc: "More details about this pin"
                }
            ];

            locations.forEach(loc => {
                const icon = L.divIcon({
                    html: pinSvg,
                    className: "text-red-500", // you control styling
                    iconSize: [28, 28],
                    iconAnchor: [14, 28] // center bottom → matches pin tail
                });

                const marker = L.marker(loc.coords, {icon}).addTo(map);

                const html = `
                <div style="padding:10px; width:180px;">
                    <h3 style="margin:0; font-size:16px;">${loc.title}</h3>
                    <p style="margin-top:4px; font-size:13px; color:#555;">
                        ${loc.desc}
                    </p>
                </div>
            `;

                marker.bindPopup(html);
            });
        }

        loadLeaflet();

    }, []);

    return (
        <div
            id="map"
            style={{height: "500px", width: "100%", borderRadius: "8px"}}
        />
    );
}