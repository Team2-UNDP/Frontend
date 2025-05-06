"use client";
import { useState } from "react";
import Image from "next/image";

export default function DroneModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] = useState<
    "info" | "add" | "edit" | "delete"
  >("info");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[700px] rounded-xl shadow-lg relative p-8 flex">
        {/* Close Button */}
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

        {/* Content Sections */}
        <div className="w-2/3 pl-6 text-black">
          {activeSection === "info" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Drone Information</h3>
              <div className="flex items-center gap-4">
                <label htmlFor="name" className="font-bold min-w-[60px]">
                  Drone Name:
                </label>
                <select
                  id="name"
                  className="flex-1 border border-black rounded px-2 py-1"
                >
                  <option>Drone 1</option>
                  <option>Drone 2</option>
                </select>
              </div>
              <p>
                <strong>Drone ID:</strong> B001
              </p>
              <p>
                <strong>Status:</strong> Active
              </p>
              <p>
                <strong>Date Installed:</strong> 10/10/23
              </p>
              <p>
                <strong>Last Maintenance:</strong> 10/10/23
              </p>
              <p>
                <strong>Battery:</strong> 86%
              </p>
              <p>
                <strong>Last Charged:</strong> Last 4 days ago
              </p>
            </div>
          )}

          {(activeSection === "add" || activeSection === "edit") && (
            <>
              <div className="flex flex-row items-center gap-4 mb-4">
                <h3 className="text-xl font-bold">
                  {activeSection === "add" ? "Add Drone" : "Edit Drone"}
                </h3>
                {activeSection === "edit" && (
                  <select className="border border-black rounded px-4 py-1 w-fit ">
                    <option>Drone 1</option>
                    <option>Drone 2</option>
                  </select>
                )}
              </div>
              <form className="space-y-6">
                <div className="flex items-start">
                  <label htmlFor="name" className="font-bold min-w-[60px] mt-1">
                    Name:
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-start">
                  <label
                    htmlFor="Drone_id"
                    className="font-bold min-w-[80px] mt-1"
                  >
                    Drone ID:
                  </label>
                  <input
                    id="Drone_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="status" className="font-bold min-w-[60px]">
                    Status:
                  </label>
                  <select
                    id="status"
                    className="flex-1 border border-black rounded px-2 py-1"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="location"
                    className="font-bold text-sm min-w-[60px]"
                  >
                    Location of Deployment:
                  </label>
                  <input
                    id="location"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="feedback" className="font-bold min-w-[60px]">
                    Live Feedback Link:
                  </label>
                  <input
                    id="feedback"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                {activeSection === "edit" && (
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="last_maintenance"
                      className="font-bold min-w-[60px]"
                    >
                      Last Maintenance:
                    </label>
                    <input
                      id="last_maintenance"
                      className="flex-1 border border-black rounded px-2 py-1"
                    />
                  </div>
                )}
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                    {activeSection === "add" ? "Add Drone" : "Edit Drone"}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeSection === "delete" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Delete Drone</h3>
              <form className="space-y-4">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="delete_Drone_id"
                    className="font-bold min-w-[60px]"
                  >
                    Enter Drone ID:
                  </label>
                  <input
                    id="delete_Drone_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                    Delete Drone
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
