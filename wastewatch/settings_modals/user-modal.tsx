"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function UserModal({
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

  const [userInfo, setUserInfo] = useState<{
    name: string;
    username: string;
    role: string;
    dateCreated: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isOpen) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://127.0.0.1:5000/user/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUserInfo({
              name: data.name,
              username: data.username,
              role: data.role,
              dateCreated: data.date_created,
            });
          } else {
            console.error("Failed to fetch user info");
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
        }
      }
    };

    fetchUserInfo();
  }, [isOpen]);

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
          <h3 className="text-3xl font-bold text-black mb-4">Account</h3>
          <ul className="space-y-4 text-black">
            {["info", "add", "edit", "delete"].map((section) => {
              const labels: Record<string, string> = {
                info: "Information",
                add: "Add User",
                edit: "Edit User",
                delete: "Delete User",
              };
              const icons: Record<string, string> = {
                info: "/icons/Account.png",
                add: "/icons/AddAcc.png",
                edit: "/icons/EditAcc.png",
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
              <h3 className="text-xl font-bold mb-4">User Information</h3>
              <p>
                <strong>Name:</strong> John Doe Cruz
              </p>
              <p>
                <strong>Username:</strong> JDCruz
              </p>
              <p>
                <strong>Role:</strong> Admin
              </p>
              <p>
                <strong>Date Created:</strong> 10/10/23
              </p>
            </div>
          )}

          {(activeSection === "add" || activeSection === "edit") && (
            <>
              <form className="space-y-6">
                <h3 className="text-xl font-bold">
                  {activeSection === "add" ? "Add Account" : "Edit Account"}
                </h3>
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
                    htmlFor="User_id"
                    className="font-bold min-w-[90px] mt-1"
                  >
                    Username:
                  </label>
                  <input
                    id="User_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="status" className="font-bold min-w-[50px]">
                    Role:
                  </label>
                  <select
                    id="status"
                    className="flex-1 border border-black rounded px-2 py-1"
                  >
                    <option>Admin</option>
                    <option>User</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="location" className="font-bold min-w-[60px]">
                    Password:
                  </label>
                  <input
                    id="location"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="feedback" className="font-bold min-w-[60px]">
                    Confirm Password:
                  </label>
                  <input
                    id="feedback"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                    {activeSection === "add" ? "Add User" : "Edit User"}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeSection === "delete" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Delete User</h3>
              <form className="space-y-4">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="delete_user_id"
                    className="font-bold min-w-[60px]"
                  >
                    Enter Password:
                  </label>
                  <input
                    id="delete_user_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                    Delete Account
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
