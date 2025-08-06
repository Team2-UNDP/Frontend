"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { json } from "stream/consumers";
import MessageModal from "../components/message-modal"; // Adjust the import path as necessary

export default function BuoyModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] = useState<
    "info" | "add" | "edit" | "delete"
  >("info");
    const [buoys, setBuoys] = useState([]);
  const [selectedBuoy, setSelectedBuoy] = useState<string>("");
  const [buoyData, setBuoyData] = useState<Buoy>();
  const [refreshBuoys, setRefreshBuoys] = useState(false);
  const [buoyId, setBuoyId] = useState<string>("");
  const router = useRouter();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  interface BuoyLocation {
    lat: number;
    long: number;
    date: string; // or Date if you parse it
  }

  interface Buoy {
    id?: string;
    name?: string;
    status?: string;
    battery_level?: number;
    locations?: BuoyLocation[];
  }

  useEffect(() => {
    const fetchBuoyData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/buoy/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const { data } = await res.json();
          setBuoys(data);
          if (data.length > 0) {
            setSelectedBuoy(data[0].name);
            setBuoyData(data[0]);
            setBuoyId(data[0]._id);
          }
        } else {
          const error = await res.json();
          console.error("Error fetching buoy data:", error.detail);
        }
      } catch (err) {
        console.error("Error fetching buoy data:", err);
      }
    };

    if (isOpen || refreshBuoys) {
      fetchBuoyData();
      setRefreshBuoys(false);
    }
  }, [isOpen, refreshBuoys]);

  const handleSubmitBuoy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const baseData = {
      name: formData.get("name") as string,
      status: formData.get("status") as string,
      live_feed_link: formData.get("feedback") as string,
    };

    if (!baseData.name || !baseData.status || !baseData.live_feed_link) {
      setMessageText("All fields are required.");
      setShowMessageModal(true);
      return;
    }

    if (activeSection === "add") {
      baseData.installation_date = new Date().toISOString();
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/buoy/${activeSection === "edit" ? buoyId : ""}`,
        {
          method: activeSection === "edit" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(baseData),
        }
      );

      if (res.ok) {
        setMessageText(`Buoy ${activeSection === "edit" ? "updated" : "added"} successfully!`);
        setShowMessageModal(true);
        setRefreshBuoys(true);
        onClose();
        router.reload();
      } else {
        const error = await res.json();
        setMessageText(`Error: ${error.detail}`);
        setShowMessageModal(true);
      }
    } catch (err) {
      console.error(`Error ${activeSection === "edit" ? "editing" : "adding"} buoy:`, err);
      setMessageText(`Failed to ${activeSection === "edit" ? "edit" : "add"} buoy.`);
      setShowMessageModal(true);
    }
  };

  const handleBuoyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedBuoy(selectedName);

    const selected = buoys.find((b) => b.name === selectedName);
    if (selected) {
      setBuoyData(selected);
      setBuoyId(selected._id || "");
    } else {
      setBuoyData(null);
      setBuoyId("");
    }
  };

  const handleDeleteBuoy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const buoyId = (form.querySelector("#delete_Buoy_id") as HTMLInputElement).value.trim();

    if (!buoyId) {
      setMessageText("Buoy ID is required.");
      setShowMessageModal(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/buoy/${buoyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        setMessageText("Buoy deleted successfully!");
        setShowMessageModal(true);
        setRefreshBuoys(true); // if you want to re-fetch buoy list
        router.reload();
      } else {
        const err = await response.json();
        setMessageText(`Failed to delete buoy: ${err.detail || "Unknown error"}`);
        setShowMessageModal(true);
      }
    } catch (error) {
      console.error("Error deleting buoy:", error);
      setMessageText("Something went wrong while trying to delete the buoy.");
      setShowMessageModal(true);
    }
  };


  const latestLocations = buoyData?.locations
    ?.sort((a: { date: string }, b: { date: string }) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[700px] rounded-xl shadow-lg relative p-8 flex">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-full transition duration-150 cursor-pointer"
        >
          <Image src="/icons/Close.png" alt="Close" width={12} height={12} />
        </button>

        {/* Sidebar */}
        <div className="w-1/3 pr-6 border-r-2 border-black">
          <h2 className="text-xl font-bold mb-4">Buoy</h2>
          <ul className="space-y-4 text-black">
            {["info", "add", "edit", "delete"].map((section) => {
              const labels: Record<string, string> = {
                info: "Information",
                add: "Add Buoy",
                edit: "Edit Buoy",
                delete: "Delete Buoy",
              };
              const icons: Record<string, string> = {
                info: "/icons/BuoyInfo.png",
                add: "/icons/BuoyAdd.png",
                edit: "/icons/BuoyEdit.png",
                delete: "/icons/Delete.png",
              };
              return (
                <li
                  key={section}
                  className={`flex items-center gap-2 cursor-pointer font-semibold ${
                    activeSection === section ? "text-[#065C7C]" : ""
                  }`}
                  onClick={() => setActiveSection(section as any)}
                >
                  <Image
                    src={icons[section]}
                    alt={section}
                    width={24}
                    height={24}
                  />
                  {labels[section]}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Content Sections */}
        <div className="w-2/3 pl-6 text-black">
          {activeSection === "info" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Buoy Information</h3>
              <div className="flex items-center gap-4">
                <label htmlFor="name" className="font-bold min-w-[60px]">
                  Buoy Name:
                </label>
                  <select
                    id="name"
                    className="flex-1 border border-black rounded px-2 py-1"
                    value={selectedBuoy}
                    onChange={handleBuoyChange}
                  >
                    {buoys.map((buoy) => (
                      <option key={buoy._id} value={buoy.name}>
                        {buoy.name}
                      </option>
                    ))}
                  </select>

              </div>
              {buoyData ? (
                <>
                  <p>
                    <strong>Buoy ID:</strong> {buoyData._id || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {buoyData.status || "N/A"}
                  </p>
                  <p>
                    <strong>Date Installed:</strong> {new Date(buoyData.installation_date).toLocaleDateString() || "N/A"}
                  </p>
                  <p>
                    <strong>Last Maintenance:</strong> {new Date(buoyData.last_maintenance).toLocaleDateString() || "N/A"}
                  </p>
                  <p>
                    <strong>Battery Level:</strong> {buoyData.battery_level || "N/A"}%
                  </p>
                  <p>
                    <strong>Last Charged:</strong> {new Date(buoyData.last_charged).toLocaleDateString() || "N/A"}
                  </p>
                  <p>
                    <strong>Live Feed Link:</strong> <a href={buoyData.live_feed_link} target="_blank" rel="noopener noreferrer">{buoyData.live_feed_link}</a>
                  </p>
                  <p>
                    <strong>Locations:</strong>
                  </p>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                  <ul className="list-disc pl-6">
                    {latestLocations && latestLocations.length > 0 ? (
                      latestLocations.map((location: { date: string; lat: number; long: number }, index: number) => (
                        <li key={index}>
                          Date: {new Date(location.date).toLocaleDateString()}, Latitude: {location.lat}, Longitude: {location.long}
                        </li>
                      ))
                    ) : (
                      <li>No location data available.</li>
                    )}
                  </ul>
                </div>
                </>
              ) : (
                <p>No buoy data available.</p>
              )}
            </div>
          )}

          {(activeSection === "add" || activeSection === "edit") && (
            <>
              <div className="flex flex-row items-center gap-4 mb-4">
                <h3 className="text-xl font-bold">
                  {activeSection === "add" ? "Add Buoy" : "Edit Buoy"}
                </h3>
                {activeSection === "edit" && (
                  <select
                    id="name"
                    className="flex-1 border border-black rounded px-2 py-1"
                    value={selectedBuoy}
                    onChange={handleBuoyChange}
                  >
                    {buoys.map((buoy) => (
                      <option key={buoy._id} value={buoy.name}>
                        {buoy.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <form className="space-y-6" onSubmit={handleSubmitBuoy}>
                <div className="flex items-start">
                  <label htmlFor="name" className="font-bold min-w-[60px] mt-1">
                  Name:
                  </label>
                  <input
                  id="name"
                  name="name"
                  type="text"
                  value={buoyData?.name ?? ""}
                  onChange={(e) => {
                    setBuoyData((prev) => ({
                    ...prev,
                    name: e.target.value,
                    }));
                  }}
                  className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                {activeSection === "edit" && (
                  <div className="flex items-start">
                  <label
                    htmlFor="Buoy_id"
                    className="font-bold min-w-[80px] mt-1"
                  >
                    Buoy ID:
                  </label>
                  <input
                    id="Buoy_id"
                    name="Buoy_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1 bg-gray-200"
                    value={buoyData?._id || ""}
                    readOnly
                  />
                  </div>
                )}
                <div className="flex items-center">
                  <label htmlFor="status" className="font-bold min-w-[60px]">
                    Status:
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={activeSection === "edit" ? (buoyData.status === "Inactive" ? "Inactive" : "Active") : ""}
                    className="flex-1 border border-black rounded px-2 py-1"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="feedback" className="font-bold min-w-[60px]">
                  Live Feedback Link:
                  </label>
                  <input
                    id="feedback"
                    name="feedback"
                    type="text"
                    value={buoyData?.live_feed_link ?? ""}
                    onChange={(e) =>
                      setBuoyData((prev) => ({
                        ...prev,
                        live_feed_link: e.target.value,
                      }))
                    }
                    className="flex-1 border border-black rounded px-2 py-1"
                  />

                </div>
                <div className="flex justify-center py-6">
                  <button
                  type="submit"
                  className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                  {activeSection === "add" ? "Add Buoy" : "Edit Buoy"}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeSection === "delete" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Delete Buoy</h3>
              <form className="space-y-4" onSubmit={handleDeleteBuoy}>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="delete_Buoy_id"
                    className="font-bold min-w-[60px]"
                  >
                    Enter Buoy ID:
                  </label>
                  <input
                    id="delete_Buoy_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                    Delete Buoy
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      {showMessageModal && (
        <MessageModal message={messageText} onClose={() => setShowMessageModal(false)} />
      )}
    </div>
  );
}
