"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BuoyModal from "@/settings_modals/buoy-modal";
import UserModal from "@/settings_modals/user-modal";
import DroneModal from "@/settings_modals/drone-modal";
import Modal from "./message-modal";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [showBuoyModal, setShowBuoyModal] = useState(false);
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#041F33] text-white flex items-center justify-between px-6 py-6 relative z-50">
      <Link href="/homepage">
        <div className="flex items-center gap-2 cursor-pointer">
          <Image src="/icons/Buoy.png" alt="Logo" width={24} height={24} />
          <h1 className="text-xl font-semibold">WasteWatch</h1>
        </div>
      </Link>

      <nav className="flex items-center gap-6">
        {[
          { label: "Home", href: "/homepage" },
          { label: "About", href: "/about" },
        ].map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="relative group text-white font-medium"
          >
            {item.label}
            <span className="pointer-events-none absolute bottom-0 left-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </Link>
        ))}

        {/* Wrap button + dropdown together inside the ref */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="p-1.5 hover:bg-[#22323e] rounded-full transition duration-150 cursor-pointer"
          >
            <Image
              src="/icons/Settings.png"
              alt="Settings"
              width={24}
              height={24}
              className="-mt-0.5"
            />
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-md z-50">
              <div className="p-4 font-semibold">Settings</div>
              <ul className="px-4 pb-4 space-y-3">
                <li
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#065C7C]"
                >
                  <Image
                    src="/icons/User.png"
                    alt="Account"
                    width={20}
                    height={20}
                  />
                  Account
                </li>
                <li
                  onClick={() => setShowBuoyModal(true)}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#065C7C]"
                >
                  <Image
                    src="/icons/BuoyIcon.png"
                    alt="Buoy"
                    width={20}
                    height={20}
                  />
                  Buoy
                </li>
                <li
                  onClick={() => setShowDroneModal(true)}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#065C7C]"
                >
                  <Image
                    src="/icons/DroneIcon.png"
                    alt="Drone"
                    width={20}
                    height={20}
                  />
                  Drone
                </li>
                <li
                  onClick={async () => {
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/user/logout`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      });
                
                      if (res.ok) {
                        localStorage.removeItem("token");
                        setModalMessage("Logged out successfully!");
                        setShowModal(true);

                        // Optional redirect after short delay
                        setTimeout(() => {
                          window.location.href = "/login";
                        }, 1000);
                      } else {
                        setModalMessage("Logout failed. Please try again.");
                        setShowModal(true);
                      }
                    } catch (err) {
                      console.error("Logout error:", err);
                      setModalMessage("Logout failed. Server error.");
                      setShowModal(true);
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#065C7C]"
                >
                  <Image
                    src="/icons/Logout.png"
                    alt="Logout"
                    width={20}
                    height={20}
                  />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => {
            setShowModal(false);
            if (modalMessage === "Logged out successfully!") {
              window.location.href = "/login";
            }
          }}
        />
      )}

      {/* Modals */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
      <BuoyModal
        isOpen={showBuoyModal}
        onClose={() => setShowBuoyModal(false)}
      />
      <DroneModal
        isOpen={showDroneModal}
        onClose={() => setShowDroneModal(false)}
      />
    </header>
  );
}
