"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

type MapComponentProps = {
  coordinatesList: [number, number][];
  setCoordinatesList: React.Dispatch<React.SetStateAction<[number, number][]>>;
  selectedDays: number | null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  coordinatesList,
  setCoordinatesList,
  selectedDays,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    import("leaflet/dist/leaflet.css");

    if (!mapRef.current || mapInstanceRef.current) return;

    const waitForMapResize = (map: any, attempts = 10) => {
      if (attempts <= 0) return;
      requestAnimationFrame(() => {
        if (mapRef.current?.clientWidth && mapRef.current?.clientHeight) {
          map.invalidateSize();
        } else {
          waitForMapResize(map, attempts - 1);
        }
      });
    };

    (async () => {
      const map = await initializeLeafletMap(mapRef.current!, (lat, lng) => {
        setCoordinatesList((prev) => [...prev, [lat, lng]]);
      });
      mapInstanceRef.current = map;
      waitForMapResize(map);
    })();
  }, [setCoordinatesList]);

  function generateDummyPath(lat: number, lng: number): [number, number][] {
    const path: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      lat += (Math.random() - 0.5) * 0.01;
      lng += (Math.random() - 0.5) * 0.01;
      path.push([lat, lng]);
    }
    return path;
  }

  const simulatePaths = () => {
    const map = mapInstanceRef.current;
    if (!map || coordinatesList.length === 0 || selectedDays === null) {
      alert("Please select coordinates and a day value before simulating.");
      return;
    }

    coordinatesList.forEach(([lat, lng]) => {
      drawPath(map, lat, lng, generateDummyPath);
    });
  };

  async function initializeLeafletMap(
    container: HTMLDivElement,
    onClickCallback: (lat: number, lng: number) => void
  ) {
    const L = await import("leaflet");
    const map = L.map(container).setView([7.0806, 125.6476], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      onClickCallback(lat, lng);

      const customIcon = L.icon({
        iconUrl: "/icons/Coordinate.png",
        iconSize: [16, 18],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      L.marker([lat, lng], { icon: customIcon }).addTo(map);
    });

    return map;
  }

  function drawPath(
    map: any,
    lat: number,
    lng: number,
    generatePath: (lat: number, lng: number) => [number, number][]
  ) {
    const L = require("leaflet");
    const pathCoords = generatePath(lat, lng);
    const latLngs = pathCoords.map(([lat, lng]) => [lat, lng]);
    map.fitBounds(latLngs);
    L.polyline(latLngs, { color: "blue" }).addTo(map);
  }

  return (
    <div className="col-span-2 rounded-xl p-4 relative">
      <h2 className="text-white text-3xl font-bold mb-4">Map Overview</h2>
      <div className="relative h-[500px] overflow-hidden rounded-3xl border-2 border-[#ACDCFF]">
        <div
          ref={mapRef}
          id="map"
          className="absolute inset-0 w-full h-full z-10"
        />
      </div>
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={simulatePaths}
          className={`bg-[#174D6A] border border-white px-6 py-1 rounded-full text-white w-fit ${
            coordinatesList.length > 0 && selectedDays
              ? "hover:bg-[#016b87] cursor-pointer"
              : "cursor-not-allowed opacity-50"
          }`}
          disabled={coordinatesList.length === 0 || selectedDays === null}
        >
          Start Simulating
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
