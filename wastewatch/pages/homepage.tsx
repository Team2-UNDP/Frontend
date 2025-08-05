import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Header from "@/components/header";
import { useRouter } from "next/router";
import LeafletMap from "@/components/leaflet_map";

export default function WasteWatchDashboard() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [buoys, setBuoys] = useState<any[]>([]); // Store buoy data, initialized as an empty array
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const getBuoyName = createBuoyNameLookup(buoys);
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  type TrashCount = {
    small_count: number;
    medium_count: number;
    heavy_count: number;
  };

  type Notification = {
    _id: string;
    detection_type: string;
    buoy_id: string;
    timestamp: string;
    trash_count: TrashCount[];
    time_window: string;
    last_detection_id: string | null;
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    setSelectedDate(today);
  }, []);

  const handleIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker(); // triggers the date input
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsSignedIn(false);
      router.push("/");
      return setLoading(false);
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("user_info", JSON.stringify(data));
          setIsSignedIn(true);
        } else {
          setIsSignedIn(false);
          localStorage.removeItem("token");
          router.push("/");
        }
      } catch (err) {
        console.log(err);
        setIsSignedIn(false);
        localStorage.removeItem("token");
        router.push("/");
      } finally {
        setLoading(false); // Ensure this is always called last
      }
    };

    verifyUser();
  }, [router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/notification/`);
        const data = await res.json();
        setNotifications(data.data);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/notifications`);

    ws.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        console.log("📡 New WebSocket Notification:", newNotif);

        setNotifications((prevNotifs) => {
          // Avoid duplicate notifications
          const exists = prevNotifs.some((n) => n._id === newNotif._id);
          if (exists) {
            // Optionally update existing notification if content has changed
            return prevNotifs.map((n) => (n._id === newNotif._id ? newNotif : n));
          }
          return [newNotif, ...prevNotifs];
        });
      } catch (e) {
        console.error("❌ Error parsing WebSocket message:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Fetch buoy data
  useEffect(() => {
    const fetchBuoys = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/buoy?date=${selectedDate}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const responseData = await res.json();
          if (responseData && Array.isArray(responseData.data)) {
            setBuoys(responseData.data);
          } else {
            console.error("Unexpected data format: Buoys data is not an array");
            setBuoys([]);
          }
        } else {
          console.error("Failed to fetch buoys");
        }
      } catch (err) {
        console.error("Error fetching buoys:", err);
      }
    };

    fetchBuoys();
  }, [selectedDate]);

  const markNotificationAsRead = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Filter unread notifications
      const unreadNotifs = notifications.filter((notif) => !notif.read);

      // Send individual PUT requests for each unread notification
      const updatePromises = unreadNotifs.map(async (notif) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/notification/${notif._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ read: true }),
        });

        const data = await res.json();
        console.log(`✅ Updated notification ${notif._id}:`, data);
        return data;
      });

      await Promise.all(updatePromises); // Wait for all updates to complete

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );

      setDropdownOpen(false);
      console.log("✅ All unread notifications marked as read individually.");
    } catch (err) {
      console.error("❌ Failed to mark all notifications as read:", err);
    }
  };



  // Accepts the buoys array, returns a function to get buoy name by ID
  function createBuoyNameLookup(buoys: { _id: string; name: string }[]) {
    // Build a Map for fast lookup
    const buoyMap = new Map(buoys.map(b => [b._id, b.name]));

    // Return a function that takes an ID and returns the name or the ID if not found
    return (id: string) => buoyMap.get(id) ?? id;
  }

  return (
    <div className="font-poppins bg-ocean-gradient min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      ) : !isSignedIn ? (
        // You can show a login screen or something else instead of null
        <div>Please sign in to continue.</div>
      ) : (
        <div>
        <Header />
        <title>WasteWatch Dashboard</title>
        <main className="bg-ocean-gradient p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-full">
          <section className="col-span-2 rounded-xl p-4 relative">
            <h2 className="text-white text-3xl font-bold mb-4">Map Overview</h2>
            <div className="relative overflow-hidden rounded-3xl border-2 border-solid border-[#ACDCFF]">
                <div className="relative h-[500px] overflow-hidden rounded-3xl border-2 border-[#ACDCFF] z-10">
                {/* Use the LeafletMap component */}
                <LeafletMap
                  key={selectedDate}
                  center={[7.0806, 125.6476]}
                  zoom={10}
                  markers={buoys.map((buoy) => ({
                    lat: buoy.locations[buoy.locations.length - 1]?.lat || 0,
                    long: buoy.locations[buoy.locations.length - 1]?.long || 0,
                    id: buoy._id,
                    name: buoy.name,
                    status: buoy.status,
                    batteryLevel: buoy.battery_level,
                    lastCharged: buoy.last_charged,
                    installationDate: buoy.installation_date,
                    lastMaintenance: buoy.last_maintenance,
                    address: buoy.live_feed_link,
                  }))}
                />
                </div>

              {/* Legends */}
              <div className="absolute bottom-4 left-4 bg-white rounded-md px-3 py-2 text-sm text-black shadow z-10">
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

              {/* Date Filter */}
              <div className="absolute top-4 right-4 text-white flex px-4 z-10">
                <div className="relative bg-ocean-gradient rounded-xl px-2 py-1 border border-white flex items-center">
                {/* Hidden date input */}
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    console.log("Selected date:", e.target.value);
                  }}
                  className="appearance-none bg-transparent text-white outline-none cursor-pointer w-full pr-10 custom-date-input"
                  style={{
                    colorScheme: "dark", // Makes sure the calendar is styled for dark mode
                  }}
                />

                {/* Custom dropdown icon */}
                <button
                  type="button"
                  onClick={handleIconClick}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Image
                    src="/icons/Dropdown.png"
                    alt="Dropdown"
                    width={16}
                    height={16}
                  />
                </button>
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
                      <button 
                      onClick={markAllAsRead}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left font-normal cursor-pointer">
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

              {/* Notification List */}
              <div className="mt-4 bg-white p-5 rounded-2xl">
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {notifications.map((item, idx) => (
                    <div
                      key={item._id}
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
                          <p
                            className={`text-sm ${
                              item.read ? "font-medium text-black" : "font-black text-black"
                            }`}
                          >
                            {getBuoyName(item.buoy_id)}
                          </p>
                          <p
                            className={`text-xs ${
                              item.read ? "text-gray-600" : "text-black"
                            }`}
                          >
                            {item.detection_type === "sustain_alert"
                              ? "Accumulation Detected"
                              : "Trash Detected"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(item.trash_count?.[0]?.heavy_count || 0) > 5 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-lg w-fit max-w-fit p-6 relative flex flex-col custom-scroll scroll-smooth">
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

                    {/* Notification List */}
                    <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(400px - 64px)' }}>
                      {notifications.map((item, idx) => (
                        <div
                          key={item._id}
                          className="grid grid-cols-3 gap-4 py-3 border border-gray-200 rounded-md px-5 items-center"
                        >
                          <div className="flex items-center gap-1">
                            <Image
                              src="/icons/BuoyDark.png"
                              alt="Buoy Icon"
                              width={20}
                              height={20}
                            />
                          <p
                            className={`text-sm ${
                              item.read ? "font-black text-medium" : "font-black text-black"
                            }`}
                          >
                            {getBuoyName(item.buoy_id)}
                          </p>                          </div>
                          <p className="text-sm text-left text-[#B70000] font-medium">
                            {item.detection_type === "sustain_alert"
                              ? "Accumulation Detected"
                              : "Trash Detected"}
                          </p>
                          <p className="text-sm text-right ml-10">
                            {new Date(item.timestamp).toLocaleString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
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
      )}
    </div>
  );
}
