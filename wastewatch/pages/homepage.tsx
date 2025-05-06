import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Header from "@/components/header";

export default function WasteWatchDashboard() {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [coordinatesList, setCoordinatesList] = useState<[number, number][]>(
    []
  );
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === "undefined" || !mapRef.current) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix: Destroy existing map instance if already initialized
      if (mapRef.current && (mapRef.current as any)._leaflet_id != null) {
        return; // Map already initialized
      }

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

        const customIcon = L.icon({
          iconUrl: "/icons/Coordinate.png",
          iconSize: [16, 18],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map);
      });

      requestAnimationFrame(() => map.invalidateSize());
      setMapInstance(map);
    };

    // Run loadMap only if map is not yet initialized
    if (!mapInstance) {
      loadMap();
    }
  }, [mapRef, mapInstance]);

  return (
    <div className="font-poppins bg-gradient-to-br from-[#065C7C] to-[#0C2E3F] min-h-screen">
      <Header />
      <title>WasteWatch Dashboard</title>
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-2 rounded-xl p-4 relative">
          <h2 className="text-white text-3xl font-bold mb-4">Map Overview</h2>
          <div className="relative overflow-hidden rounded-3xl border-2 border-solid border-[#ACDCFF]">
            <div className="relative h-[500px] overflow-hidden rounded-3xl border-2 border-[#ACDCFF]">
              <div
                ref={mapRef}
                id="map"
                className="absolute inset-0 w-full h-full z-10"
              />
            </div>
            <Image
              src="/icons/Drone1.png"
              alt="Drone"
              width={32}
              height={24}
              className="absolute top-[40%] left-[45%] z-50"
            />

            <div className="absolute top-[40%] left-[50%] w-fit group z-50">
              <Image
                src="/icons/Active.png"
                alt="Active Buoy"
                width={32}
                height={32}
                className="cursor-pointer"
              />
              <div className="hidden group-hover:block absolute left-8 top-0 bg-white text-black rounded-xl shadow-lg p-3 w-44 z-10">
                <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
                  <span className="font-bold text-sm">BUOY 1</span>
                  <span className="text-green-500 text-sm font-semibold">
                    Active
                  </span>
                </div>
                <div
                  onClick={() => (window.location.href = "/live-cam-info")}
                  className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 rounded-md"
                >
                  <Image
                    src="/icons/LiveCam.png"
                    alt="Live Cam"
                    width={20}
                    height={20}
                    className="mr-2 mb-1"
                  />
                  <span className="text-sm font-medium">Live Cam</span>
                </div>
                <div
                  onClick={() => setShowModal(true)}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
                >
                  <Image
                    src="/icons/Details.png"
                    alt="Details"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Details</span>
                </div>
              </div>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-full transition duration-150 cursor-pointer"
                  >
                    <Image
                      src="/icons/Close.png"
                      alt="Close"
                      width={12}
                      height={12}
                    />
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Details</h2>
                  <p>
                    <strong>Name:</strong> BUOY 1
                  </p>
                  <p>
                    <strong>Status:</strong> Active
                  </p>
                  <p>
                    <strong>Lat:</strong> 37.7749
                  </p>
                  <p>
                    <strong>Long:</strong> 122.4194
                  </p>
                  <p>
                    <strong>Installed on:</strong> April 01, 2025
                  </p>
                  <p>
                    <strong>Last Maintenance:</strong> April 04, 2025
                  </p>
                  <p>
                    <strong>Battery:</strong> 86%
                  </p>
                  <p>
                    <strong>Last Charged:</strong> Last 4 days ago
                  </p>
                </div>
              </div>
            )}

            <Image
              src="/icons/Inactive.png"
              alt="Inactive Buoy"
              width={32}
              height={32}
              className="absolute top-[60%] left-[40%] z-50"
            />

            {/* Legends */}
            <div className="absolute bottom-4 left-4 bg-white rounded-md px-3 py-2 text-sm text-black shadow z-50">
              <p className="font-bold mb-1">Legends</p>
              <span className="block w-32 h-[1px] bg-[#ADADAD] mt-1"></span>
              <ul>
                <li>
                  <Image
                    src="/icons/Drone.png"
                    alt="Drone"
                    width={24}
                    height={24}
                    className="inline mr-1"
                  />{" "}
                  Drone
                </li>
                <li>
                  <Image
                    src="/icons/Active.png"
                    alt="Active"
                    width={24}
                    height={24}
                    className="inline mr-1"
                  />{" "}
                  Active Buoy
                </li>
                <li>
                  <Image
                    src="/icons/Inactive.png"
                    alt="Inactive"
                    width={24}
                    height={24}
                    className="inline mr-1"
                  />{" "}
                  Inactive Buoy
                </li>
              </ul>
            </div>

            {/* Filter */}
            <div className="absolute top-4 right-4 text-white flex px-4">
              <div className="relative bg-opacity-10 rounded-xl px-2 py-1 ml-2 border border-white">
                <select
                  id="filter"
                  className="appearance-none bg-transparent text-white pr-32 outline-none"
                >
                  <option>Date</option>
                </select>
                <Image
                  src="/icons/Dropdown.png"
                  alt="Dropdown"
                  width={16}
                  height={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section>
            <div className="flex justify-between items-center mt-4 relative">
              <h2 className="text-white text-3xl font-bold">Notifications</h2>

              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="cursor-pointer hover:bg-[#065C7C] rounded-full p-1"
                >
                  <Image
                    src="/icons/Dots.png"
                    alt="Dots"
                    width={24}
                    height={24}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-md z-10 py-2 text-sm text-black">
                    <button className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left font-normal cursor-pointer">
                      <Image
                        src="/icons/Check.png"
                        width={16}
                        height={16}
                        className="mr-2"
                        alt="Check"
                      />
                      Mark all as read
                    </button>
                    <button
                      onClick={openModal}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                    >
                      <Image
                        src="/icons/open.png"
                        width={16}
                        height={16}
                        className="mr-2"
                        alt="Open"
                      />
                      Open Notifications
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4 bg-white p-5 rounded-2xl">
              {[1, 2, 3].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-lg shadow flex items-center justify-between border border-black"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons/BuoyDark.png"
                      width={20}
                      height={20}
                      alt="Buoy"
                    />
                    <div>
                      <p className="font-bold text-sm">BUOY 1</p>
                      <p className="text-xs text-gray-600">
                        {idx % 2 === 0
                          ? "Trash Detected"
                          : "Accumulation Detected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                    <span className="text-xs text-gray-500">6:53 pm</span>
                  </div>
                </div>
              ))}
            </div>

            {modalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg w-fit max-w-fit p-6 h-[400px] relative overflow-auto flex flex-col custom-scroll scroll-smooth">
                  <div className="sticky top-0 z-10 bg-white pb-2">
                    <h3 className="text-xl font-bold">Notification Details</h3>
                    <h3 className="text-sm text-[#848484]">Today</h3>
                    <button
                      onClick={closeModal}
                      className="absolute top-0 right-0 p-1.5 hover:bg-gray-200 rounded-full transition duration-150 cursor-pointer"
                    >
                      <Image
                        src="/icons/Close.png"
                        alt="Close"
                        width={12}
                        height={12}
                      />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        className="grid grid-cols-3 gap-4 py-3 border border-gray-200 rounded-md px-5 items-center"
                      >
                        <div className="flex items-center gap-1">
                          <Image
                            src="/icons/BuoyDark.png"
                            alt="Buoy Icon"
                            width={20}
                            height={20}
                          />
                          <p className="text-sm font-medium">BUOY {num}</p>
                        </div>
                        <p className="text-sm text-left text-[#B70000] font-medium">
                          {num === 1
                            ? "Trash Detected"
                            : "Accumulation Detected"}
                        </p>
                        <p className="text-sm text-right ml-10">
                          April 17, 2025 - 6:53 PM
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-6">
                    <button className="bg-[#203F5A] text-white text-sm px-16 py-2 rounded-full hover:underline hover:bg-[#304b62] transition-all">
                      See Previous Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => (window.location.href = "simulation")}
              className="bg-[#174D6A] border border-white px-6 py-1 rounded-full text-white w-fit hover:bg-[#016b87] cursor-pointer"
            >
              Simulate Trash Path
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
