import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import BuoyDetailsModal from "./buoy-detail-modal";
import { createRoot } from "react-dom/client";

interface MarkerData {
    lat: number;
    long: number;
    name?: string;
    status?: string;
    batteryLevel?: string;
    lastCharged?: string;
    installationDate?: string;
    lastMaintenance?: string;
    popupText?: string;
}

interface LeafletMapProps {
    center: [number, number];
    zoom: number;
    markers: MarkerData[];
}

const LeafletMap: React.FC<LeafletMapProps> = ({ center, zoom, markers }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [selectedBuoy, setSelectedBuoy] = useState<MarkerData | null>(null);

    useEffect(() => {
        const setupMapAndMarkers = async () => {
            const L = (await import("leaflet")).default;

            if (!mapInstanceRef.current) {
                const map = L.map(mapRef.current as HTMLElement).setView(center, zoom);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; OpenStreetMap contributors",
                }).addTo(map);
                mapInstanceRef.current = map;
            }

            // Clear old markers
            mapInstanceRef.current.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    mapInstanceRef.current.removeLayer(layer);
                }
            });

            markers.forEach(({ lat, long, name, status, batteryLevel, lastCharged, installationDate, lastMaintenance }, index) => {
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
                    iconAnchor: [16, 32],
                });
            
                const marker = L.marker([lat, long], { icon: customIcon }).addTo(mapInstanceRef.current);
            
                // Create popup container
                const popupContainer = document.createElement("div");
            
                // React render content
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
                  
            
                // Bind the popup
                marker.bindPopup(popupContainer, {
                    closeOnClick: true,
                    autoClose: true,
                });
                
                // Handle hover to show
                marker.on("mouseover", () => {
                    marker.openPopup();
            
                    setTimeout(() => {
                        const liveCamButton = document.getElementById(`live-cam-${index}`);
                        const detailsButton = document.getElementById(`details-${index}`);
            
                        liveCamButton?.addEventListener("click", () => {
                            window.location.href = "/live-cam-info";
                        });
            
                        detailsButton?.addEventListener("click", () => {
                            setSelectedBuoy({
                                lat,
                                long,
                                name,
                                status,
                                batteryLevel,
                                lastCharged,
                                installationDate,
                                lastMaintenance,
                            });
                        });
                    }, 0); // Delay to ensure DOM is rendered
                });
                

            });
        };

        setupMapAndMarkers();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.eachLayer((layer: any) => {
                    if (layer instanceof L.Marker) {
                        mapInstanceRef.current.removeLayer(layer);
                    }
                });
            }
        };
    }, [center, zoom, markers]);

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
