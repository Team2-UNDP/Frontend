// pages/live-cam.js
import Image from "next/image";
import Header from "@/components/header";
import { useEffect, useState } from "react";


export default function LiveCam () {

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [buoyCam, setBuoyCam] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });

      setTime(formattedTime.toLowerCase()); // e.g., 8:59 pm
      setDate(formattedDate); // e.g., March 03, 2025
    };

    updateTime(); // initialize
    const interval = setInterval(updateTime, 1000); // update every second

    return () => clearInterval(interval); // cleanup
  }, []);

  useEffect(() => {
    const storedBuoyCam = localStorage.getItem("selectedBuoy");
    if (storedBuoyCam) {
      const decodedBuoy = decodeURIComponent(storedBuoyCam);
      const parsedBuoy = JSON.parse(decodedBuoy);
      setBuoyCam(parsedBuoy);
    }
  }, []);  // Run only once on mount

  return (
    <div className="font-poppins bg-gradient-to-br from-[#065C7C] to-[#0C2E3F]">
      <Header />
      <title>Live-Cam Information</title>
      {/* Live Cam Layout */}
      <div className="p-6 min-h-screen">
        {/* Live Cam Content */}
        <div className="flex flex-col md:flex-row">
          {/* Left: Video/Image Section */}
          <div className="px-10">
            <div className="flex gap-x-5 mb-4 w-fit">
              <Image
                src="/icons/Cam.png"
                alt="Camera"
                className="w-14 h-10"
                width={56}
                height={40}
              />
              <h2 className="text-3xl font-bold text-white">
                LIVE CAM - {}
              </h2>
            </div>
            <Image
              src="/images/Trash1.png"
              alt="Live Feed"
              className="rounded-lg"
              width={800}
              height={400}
            />

            <p className="text-white text-xl mt-4">
              <strong>Details:</strong>
            </p>
            <div className="grid grid-cols-2 text-base text-white">
              <p>Name: {buoyCam?.name}</p>
              <p>Time: {time}</p>
              <p>Resolution: 1080p</p>
              <p>Date: {date}</p>
              <p>IP: {buoyCam?.address}</p>
            </div>
          </div>

          {/* Right: Details / Detection Section */}
          <div className="flex flex-col overflow-auto h-[900px]">
            <div className="flex flex-row">
              <h3 className="text-3xl text-white font-bold mb-4">Details</h3>
              <button
                className="absolute right-8 mt-1.5"
                onClick={() => (window.location.href = "live-cam-details")}
              >
                <Image
                  src="/icons/Fullscreen.png"
                  alt="Fullscreen"
                  className="p-1.5 hover:bg-[#065C7C] rounded-full transition duration-150 cursor-pointer"
                  width={32}
                  height={32}
                />
              </button>
            </div>
            <div className="w-fit bg-[#FFFFFF] rounded-xl p-4 overflow-y-auto h-fit">
              {/* Detection Cards */}
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-[#E5ECF1] drop-shadow-md rounded-lg shadow p-3 flex flex-row"
                  >
                    <Image
                      src={`/images/Trash${item}.png`}
                      alt="Detection"
                      className="w-96 h-64 rounded mb-2"
                      width={384}
                      height={256}
                    />
                    <div className="flex flex-col ml-6 space-y-2">
                      <h3 className="text-lg font-bold">
                        Accumulation Detected!
                      </h3>
                      <p className="text-lg">
                        <strong>Volume:</strong> Heavy
                      </p>
                      <p className="text-lg">
                        <strong>Confidence:</strong> 91%
                      </p>
                      <div className="text-base pt-20 text-[#434343]">
                        <p>10/10/25</p>
                        <p>24-12-01 14:30:00</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

