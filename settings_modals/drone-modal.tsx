"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import MessageModal from "../components/message-modal";

export default function DroneModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] = useState<"info" | "add" | "edit" | "delete">("info");
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [droneData, setDroneData] = useState<any>(null);
  const [refreshDrones, setRefreshDrones] = useState(false);
  const [droneId, setDroneId] = useState<string>("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDroneData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/drone/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const { data } = await res.json();
          const filtered = data.filter((drone: any) => !drone.is_deleted);
          setDrones(filtered);
          if (filtered.length > 0) {
            setSelectedDrone(filtered[0].name);
            setDroneData(filtered[0]);
            setDroneId(filtered[0]._id);
          }
        } else {
          const error = await res.json();
          console.error("Error fetching drone data:", error.detail);
        }
      } catch (err) {
        console.error("Error fetching drone data:", err);
      }
    };

    if (isOpen || refreshDrones) {
      fetchDroneData();
      setRefreshDrones(false);
    }
  }, [isOpen, refreshDrones]);

  const handleDroneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedDrone(selectedName);
    const selected = drones.find((d) => d.name === selectedName);
    if (selected) {
      setDroneData(selected);
      setDroneId(selected._id || "");
    } else {
      setDroneData(null);
      setDroneId("");
    }
  };

  const handleSubmitDrone = async (e: React.FormEvent<HTMLFormElement>) => {
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
      baseData["installation_date"] = new Date().toISOString();
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/drone/${activeSection === "edit" ? droneId : ""}`,
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
        setMessageText(`Drone ${activeSection === "edit" ? "updated" : "added"} successfully!`);
        setShowMessageModal(true);
        setRefreshDrones(true);
        onClose();
        router.reload();
      } else {
        const error = await res.json();
        setMessageText(`Error: ${error.detail}`);
        setShowMessageModal(true);
      }
    } catch (err) {
      console.error("Error saving drone:", err);
      setMessageText("Failed to save drone.");
      setShowMessageModal(true);
    }
  };

  const handleDeleteDrone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const droneId = (form.querySelector("#delete_Drone_id") as HTMLInputElement).value.trim();

    if (!droneId) {
      setMessageText("Drone ID is required.");
      setShowMessageModal(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/drone/${droneId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        setMessageText("Drone deleted successfully!");
        setShowMessageModal(true);
        setRefreshDrones(true);
        router.reload();
      } else {
        const err = await response.json();
        setMessageText(`Failed to delete drone: ${err.detail || "Unknown error"}`);
        setShowMessageModal(true);
      }
    } catch (error) {
      console.error("Error deleting drone:", error);
      setMessageText("Something went wrong while deleting the drone.");
      setShowMessageModal(true);
    }
  };

  const latestLocations = droneData?.locations
    ?.sort((a: { date: string }, b: { date: string }) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[700px] rounded-xl shadow-lg relative p-8 flex">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-full transition duration-150 cursor-pointer"
        >
          <Image src="/icons/Close.png" alt="Close" width={12} height={12} />
        </button>

        {/* Sidebar */}
        <div className="w-1/3 pr-6 border-r-2 border-black">
          <h2 className="text-xl font-bold mb-4">Drone</h2>
          <ul className="space-y-4 text-black">
            {["info", "add", "edit", "delete"].map((section) => {
              const labels: Record<string, string> = {
                info: "Information",
                add: "Add Drone",
                edit: "Edit Drone",
                delete: "Delete Drone",
              };
              const icons: Record<string, string> = {
                info: "/icons/DroneInfo.png",
                add: "/icons/AddDrone.png",
                edit: "/icons/EditDrone.png",
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

        {/* Content Area */}
        <div className="w-2/3 pl-6 text-black">
          {activeSection === "info" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Drone Information</h3>
              <div className="flex items-center gap-4">
                <label htmlFor="droneSelect" className="font-bold min-w-[60px]">
                  Drone Name:
                </label>
                <select
                  id="droneSelect"
                  className="flex-1 border border-black rounded px-2 py-1"
                  value={selectedDrone}
                  onChange={handleDroneChange}
                >
                  {drones.map((drone) => (
                    <option key={drone._id} value={drone.name}>
                      {drone.name}
                    </option>
                  ))}
                </select>
              </div>
              {droneData ? (
                <>
                  <p><strong>Drone ID:</strong> {droneData._id}</p>
                  <p><strong>Status:</strong> {droneData.status || "N/A"}</p>
                  <p><strong>Date Installed:</strong> {droneData.installation_date ? new Date(droneData.installation_date).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Last Maintenance:</strong> {droneData.last_maintenance ? new Date(droneData.last_maintenance).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Battery:</strong> {droneData.battery_level ?? "N/A"}%</p>
                  <p><strong>Last Charged:</strong> {droneData.last_charged ? new Date(droneData.last_charged).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Live Feed Link:</strong> <a href={droneData.live_feed_link} target="_blank" rel="noopener noreferrer">{droneData.live_feed_link}</a></p>
                  <p><strong>Locations:</strong></p>
                  <ul className="list-disc pl-6 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                    {latestLocations && latestLocations.length > 0 ? (
                      latestLocations.map((loc: any, index: number) => (
                        <li key={index}>Date: {new Date(loc.date).toLocaleDateString()}, Lat: {loc.lat}, Long: {loc.long}</li>
                      ))
                    ) : (
                      <li>No location data available.</li>
                    )}
                  </ul>
                </>
              ) : (
                <p>No drone data available.</p>
              )}
            </div>
          )}

          {(activeSection === "add" || activeSection === "edit") && (
            <form className="space-y-6" onSubmit={handleSubmitDrone}>
              <h3 className="text-xl font-bold mb-4">
                {activeSection === "add" ? "Add Drone" : "Edit Drone"}
              </h3>
              {activeSection === "edit" && (
                <select
                  className="border border-black rounded px-4 py-1 mb-2 w-full"
                  value={selectedDrone}
                  onChange={handleDroneChange}
                >
                  {drones.map((drone) => (
                    <option key={drone._id} value={drone.name}>
                      {drone.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-start">
                <label htmlFor="name" className="font-bold min-w-[60px] mt-1">Name:</label>
                <input id="name" name="name" type="text" value={droneData?.name ?? ""} onChange={(e) => setDroneData((prev: any) => ({ ...prev, name: e.target.value }))} className="flex-1 border border-black rounded px-2 py-1" />
              </div>
              <div className="flex items-center">
                <label htmlFor="status" className="font-bold min-w-[60px]">Status:</label>
                <select id="status" name="status" className="flex-1 border border-black rounded px-2 py-1" defaultValue={droneData?.status || ""}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label htmlFor="feedback" className="font-bold min-w-[60px]">Live Feedback Link:</label>
                <input id="feedback" name="feedback" type="text" value={droneData?.live_feed_link ?? ""} onChange={(e) => setDroneData((prev: any) => ({ ...prev, live_feed_link: e.target.value }))} className="flex-1 border border-black rounded px-2 py-1" />
              </div>
              <div className="flex justify-center py-6">
                <button type="submit" className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow">
                  {activeSection === "add" ? "Add Drone" : "Edit Drone"}
                </button>
              </div>
            </form>
          )}

          {activeSection === "delete" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Delete Drone</h3>
              <form className="space-y-4" onSubmit={handleDeleteDrone}>
                <div className="flex items-center gap-4">
                  <label htmlFor="delete_Drone_id" className="font-bold min-w-[60px]">Enter Drone ID:</label>
                  <input id="delete_Drone_id" type="text" className="flex-1 border border-black rounded px-2 py-1" />
                </div>
                <div className="flex justify-center py-6">
                  <button type="submit" className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow">
                    Delete Drone
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
