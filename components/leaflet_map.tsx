import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import BuoyDetailsModal from "./buoy-detail-modal";
import { createRoot } from "react-dom/client";
import router from "next/router";
import { Map } from "leaflet";
interface MarkerData {
    lat: number;
    long: number;
    id?: string;
    name?: string;
    status?: string;
    batteryLevel?: string;
    lastCharged?: string;
    installationDate?: string;
    lastMaintenance?: string;
    popupText?: string;
    address?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
  mapKey?: string | number; // ← Add this
}


const LeafletMap: React.FC<LeafletMapProps> = ({ center, zoom, markers, mapKey }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const [selectedBuoy, setSelectedBuoy] = useState<MarkerData | null>(null);
    
    useEffect(() => {
    let mapInstance: Map;

    const setupMapAndMarkers = async () => {
        const L = (await import("leaflet")).default;

        // Remove old map instance completely
        if (mapInstanceRef.current) {
        mapInstanceRef.current.remove(); // Full teardown
        mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current as HTMLElement).setView(center, zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        mapInstanceRef.current = map;

        markers.forEach((markerItem, index) => {
        const {
            lat,
            long,
            id,
            name,
            status,
            batteryLevel,
            lastCharged,
            installationDate,
            lastMaintenance,
        } = markerItem;

        const customIcon = L.divIcon({
            html: `
            <div class="custom-marker cursor-pointer">
                <img src="${status === "Inactive" ? "/icons/Inactive.png" : "/icons/Active.png"}"
                    alt="${status === "Inactive" ? "Inactive Buoy" : `Buoy ${index + 1}`}"
                    width="32" height="32" />
            </div>
            `,
            className: "custom-marker",
            iconSize: [32, 32],
            iconAnchor: [0, 16],
        });

        const marker = L.marker([lat, long], { icon: customIcon }).addTo(map);

        const popupContainer = document.createElement("div");

        const root = createRoot(popupContainer);
        root.render(
            <div className="text-black text-sm space-y-2 w-30">
            <div className="flex justify-between items-center border-b border-gray-300 pb-1">
                <span className="font-bold">{name || `BUOY ${index + 1}`}</span>
                <span className={status === "Inactive" ? "text-red-500" : "text-green-500"}>
                {status}
                </span>
            </div>
            <div
                id={`live-cam-${index}`}
                className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
            >
                <img src="/icons/LiveCam.png" alt="Live Cam" width="20" height="20" className="mr-2" />
                <span>Live Cam</span>
            </div>
            <div
                id={`details-${index}`}
                className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
            >
                <img src="/icons/Details.png" alt="Details" width="16" height="16" className="mr-2" />
                <span>Details</span>
            </div>
            </div>
        );

        marker.bindPopup(popupContainer, {
            closeOnClick: true,
            autoClose: true,
        });

        marker.on("mouseover", () => {
            marker.openPopup();

            setTimeout(() => {
            document.getElementById(`live-cam-${index}`)?.addEventListener("click", () => {
                const encodedBuoy = encodeURIComponent(JSON.stringify(markerItem));
                localStorage.setItem("selectedBuoy", encodedBuoy);
                router.push("/live-cam-info");
            });

            document.getElementById(`details-${index}`)?.addEventListener("click", () => {
                setSelectedBuoy({
                lat,
                long,
                id,
                name,
                status,
                batteryLevel,
                lastCharged,
                installationDate,
                lastMaintenance,
                });
            });
            }, 0);
        });
        });
    };

    setupMapAndMarkers();

    return () => {
        if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        }
    };
    }, [center, zoom, markers, mapKey]);

    return (
        <>
            <div ref={mapRef} className="w-full h-full " />
            {selectedBuoy && (
                <BuoyDetailsModal
                    isOpen={true}
                    onClose={() => setSelectedBuoy(null)}
                    buoyData={{
                        name: selectedBuoy.name || "",
                        status: selectedBuoy.status || "",
                        lat: selectedBuoy.lat,
                        long: selectedBuoy.long,
                        installationDate: selectedBuoy.installationDate || "",
                        lastMaintenance: selectedBuoy.lastMaintenance || "",
                        battery: parseFloat(selectedBuoy.batteryLevel || "0"),
                        lastCharged: selectedBuoy.lastCharged || "",
                    }}
                />
            )}
        </>
    );
};

export default LeafletMap;
