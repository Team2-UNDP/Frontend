"use client";
import React, { useRef, useState, useEffect } from "react";
import Header from "@/components/header";
import Image from "next/image";

export default function Simulation() {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [coordinatesList, setCoordinatesList] = useState<[number, number][]>(
    []
  );
  const [historyList, setHistoryList] = useState<[number, number][]>([]);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [pathsList, setPathsList] = useState<Map<string, [number, number][]>>(
    new Map()
  );
  const [data, setData] = useState<SimulationData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toggleHistory = () => setHistoryVisible(!historyVisible);
  interface SimulationRequest {
    lon_start: number[];
    lat_start: number[];
    days_pred: number;
  }

  interface SimulationResponse {
    path: Array<{ lat: number; lon: number; days: number}>;
  }

  type SimulationData = {
    _id: string;
    user_id: string;
    lat: [number, number];
    long: [number, number];
    timestamp: string;
    num_days: number;
    predicted_lat: number[][];
    predicted_long: number[][];
  };
  

  async function querySimulationApi(request: SimulationRequest): Promise<SimulationResponse | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Read raw text body first
      const rawText = await response.text();      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      const data: SimulationResponse = JSON.parse(rawText);
      return data;
    } catch (error) {
      console.error('Error querying simulation API:', error);
      return null;
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstance) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if ((mapRef.current as any)._leaflet_id != null) return;

      const map = L.map(mapRef.current as HTMLElement).setView(
        [7.0806, 125.6476],
        10
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setCoordinatesList((prev) => [...prev, [lat, lng]]);
        setHistoryList((prev) => [...prev, [lat, lng]]);

        const customIcon = L.icon({
          iconUrl: "/icons/Coordinate.png",
          iconSize: [16, 18],
          iconAnchor: [8, 16],
          popupAnchor: [0, -32],
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map);
      });

      requestAnimationFrame(() => map.invalidateSize());
      setMapInstance(map);
    };

    loadMap();
  }, [mapRef, mapInstance]);

  const simulatePaths = async () => {
    if (
      !mapInstance ||
      coordinatesList.length === 0 ||
      selectedDays === null ||
      hasSimulated
    ) {
      if (hasSimulated) alert("Simulation already started.");
      else alert("Please select coordinates and a day value before simulating.");
      return;
    }

    const L = (await import("leaflet")).default;
    const newPathsList = new Map(pathsList);

    const lat_start: number[] = [];
    const lon_start: number[] = [];
    const predicted_lat: number[][] = [];
    const predicted_long: number[][] = [];

    for (const [lat, lng] of coordinatesList) {
      lat_start.push(lat);
      lon_start.push(lng);

      const request: SimulationRequest = {
        lat_start: [lat],
        lon_start: [lng],
        days_pred: selectedDays,
      };

      const results = await querySimulationApi(request);
      const pathCoords = results?.trajectory;

      if (!pathCoords || pathCoords.length === 0) continue;

      pathCoords.forEach((particleTrajectory: { map: (arg0: ([lon, lat]: [number, number]) => number[]) => [number, number][]; }, index: any) => {
        const latLngs: [number, number][] = particleTrajectory.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        );

        newPathsList.set(`particle_${index}`, latLngs);
        L.polyline(latLngs, { color: "blue" }).addTo(mapInstance);

        const latList = latLngs.map(([lat]) => lat);
        const lngList = latLngs.map(([, lng]) => lng);

        predicted_lat.push(latList);
        predicted_long.push(lngList);
      });
    }

    //Final payload as per backend requirement
    const simulationPayload = {
      lat: lat_start,
      long: lon_start,
      num_days: selectedDays,
      predicted_lat,
      predicted_long,
    };

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/simulation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(simulationPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to save simulation");
      }

      console.log("Simulation saved successfully!");
    } catch (error) {
      console.error("Error saving simulation:", error);
    }

    setPathsList(newPathsList);
    setHasSimulated(true);
  };


  const resetSimulation = () => {
    setCoordinatesList([]);
    setHasSimulated(false);
    setSelectedDays(null);
    setHistoryVisible(false);

    if (mapInstance) {
      mapInstance.eachLayer(async (layer: any) => {
        const L = (await import("leaflet")).default;
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapInstance.removeLayer(layer);
        }
      });
    }
  };

  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/simulation/');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result: SimulationData[] = await response.json();
        setData(result.data);
        console.log("Fetched simulation data:", result.data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchSimulation();
  }, []);

  return (
    <div className="font-poppins bg-gradient-to-br from-[#065C7C] to-[#0C2E3F] min-h-screen">
      <Header />
      <title>WasteWatch Simulation</title>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl p-4 relative">
          <h2 className="text-white text-3xl font-bold mb-4">
            Trash Path Map Simulation
          </h2>
          <div className="relative h-[500px] overflow-hidden rounded-3xl border-2 border-[#ACDCFF]">
            <div
              ref={mapRef}
              id="map"
              className="absolute inset-0 w-full h-full z-10"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <section className="bg-transparent text-white p-4 rounded-xl border border-solid border-white mt-16">
            <div className="flex-1 justify-between items-center relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Simulate Trash Path</h3>
                <button
                  onClick={toggleHistory}
                  className="cursor-pointer p-1.5 hover:bg-[#065C7C] rounded-full transition duration-150"
                >
                  <Image
                    src="/icons/History.png"
                    alt="History"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scroll">
                <div className="flex items-center">
                  <label className="block mb-1 text-white">Days:</label>
                  <div className="relative ml-2">
                    <select
                      id="daySelector"
                      value={selectedDays || ""}
                      onChange={(e) => setSelectedDays(Number(e.target.value))}
                      className="appearance-none w-fit bg-white/10 text-white py-1 pr-20 px-2 rounded-md border border-white"
                    >
                      <option value="" disabled hidden>
                        Select Days
                      </option>
                      <option value="1" className="text-black">
                        1 day
                      </option>
                      <option value="3" className="text-black">
                        3 days
                      </option>
                      <option value="7" className="text-black">
                        7 days
                      </option>
                    </select>
                    <Image
                      src="/icons/Dropdown.png"
                      alt="Dropdown"
                      className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                      width={24}
                      height={24}
                    />
                  </div>
                </div>

                {coordinatesList.length === 0 && (
                  <p className="text-sm text-gray-300">
                    No coordinates selected.
                  </p>
                )}
                {coordinatesList.map(([lat, lng], idx) => (
                  <div
                    key={idx}
                    className="bg-white text-black text-sm rounded-lg px-3 py-2 shadow"
                  >
                    <strong>Coordinate {idx + 1}:</strong> {lat.toFixed(5)},{" "}
                    {lng.toFixed(5)}
                  </div>
                ))}
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
                  disabled={
                    coordinatesList.length === 0 || selectedDays === null
                  }
                >
                  Start Simulating
                </button>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="bg-red-600 border border-white px-6 py-1 rounded-full text-white hover:bg-red-500 cursor-pointer"
                >
                  Reset Simulation
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {historyVisible && data && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">History</h2>
              <button
                onClick={toggleHistory}
                className="cursor-pointer p-1.5 hover:bg-gray-200 rounded-full transition duration-150"
              >
                <Image
                  src="/icons/Close.png"
                  alt="Close"
                  width={12}
                  height={12}
                />
              </button>
            </div>

            {data.map((item) => {
              const dateObj = new Date(item.timestamp);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString();

              // Flatten predicted coordinates for display
              const coords = item.predicted_lat.map((latArr, i) =>
                latArr.map((lat, j) => `(${lat.toFixed(3)}, ${item.predicted_long[i][j].toFixed(3)})`)
              ).flat();

              const coordStr = coords.join(", ");

              return (
                <div
                  key={item._id}
                  className="rounded-xl p-4 shadow-[0px_0px_10px_rgba(0,0,0,0.4)] space-y-1 cursor-pointer hover:bg-gray-100 transition mb-4"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{dateStr}</p>
                    <span className="text-sm">{timeStr}</span>
                  </div>

                  <p className="text-sm">
                    <span className="font-bold">Origin:</span> Lat: {item.lat.join(', ')}, Long: {item.long.join(', ')}
                  </p>

                  <p className="text-sm">
                    <span className="font-bold">Days Simulated:</span> {item.num_days}
                  </p>

                  <p className="text-sm text-gray-700">
                    {coords.length} coordinate{coords.length > 1 ? "s" : ""}
                  </p>

                  <p className="text-sm max-h-16 overflow-y-auto">
                    <span className="font-bold">Coordinates:</span> {coordStr}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
