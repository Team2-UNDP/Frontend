"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "@/components/header";

type TrashDetection = {
  _id: string;
  image_path: string;
  timestamp: string;
  volume: string;
  confidence: number;
};

export default function LiveCamFullscreen() {
  const router = useRouter();
  const [detections, setDetections] = useState<TrashDetection[]>([]);
  const [filteredDetections, setFilteredDetections] = useState<TrashDetection[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/trash_detection/`);
        const json = await res.json();
        if (json.data) {
          setDetections(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch trash detections:", error);
      }
    };

    fetchDetections();
  }, []);

  useEffect(() => {
    if (selectedVolume === "all") {
      setFilteredDetections(detections);
    } else {
      setFilteredDetections(detections.filter(d => d.volume === selectedVolume));
    }
  }, [detections, selectedVolume]);

  const downloadCSV = () => {
    const headers = ["Image", "Timestamp", "Volume", "Confidence"];
    const rows = filteredDetections.map(d => [
      d.image_path,
      new Date(d.timestamp).toLocaleString(),
      d.volume,
      `${d.confidence}%`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trash_detections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-gradient-to-br from-[#065C7C] to-[#0C2E3F] min-h-screen font-poppins">
      <Header />
      <title>Live-Cam Details</title>
      <div className="px-6 pt-4">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-[#283c46] rounded-full transition duration-150 cursor-pointer"
        >
          <Image
            src="/icons/Back-Button.png"
            alt="Back"
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* Table Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl text-white font-bold">Details</h2>
          <div className="flex gap-4 mr-2 relative">
            {/* Download CSV */}
            <button onClick={downloadCSV}>
              <Image
                src="/icons/Download.png"
                alt="Download"
                className="p-1.5 hover:bg-[#065C7C] rounded-full transition duration-150 cursor-pointer"
                width={32}
                height={32}
              />
            </button>

            {/* Filter Dropdown Toggle */}
            <button onClick={() => setShowFilter(!showFilter)}>
              <Image
                src="/icons/Filter.png"
                alt="Filter"
                className="p-1.5 hover:bg-[#065C7C] rounded-full transition duration-150 cursor-pointer"
                width={32}
                height={32}
              />
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute right-0 mt-12 w-40 bg-white shadow-md rounded-lg p-2 z-10">
                {["all", "small", "medium", "heavy"].map(volume => (
                  <button
                    key={volume}
                    onClick={() => {
                      setSelectedVolume(volume);
                      setShowFilter(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      selectedVolume === volume ? "font-semibold text-blue-600" : ""
                    }`}
                  >
                    {volume.charAt(0).toUpperCase() + volume.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="table-auto w-full border-collapse border-2 border-gray-500">
            <thead className="bg-gray-100 text-gray-700 font-semibold text-center">
              <tr className="border-2">
                <th className="border-2 border-black px-4 py-2">Image</th>
                <th className="border-2 border-black px-4 py-2">Timestamp</th>
                <th className="border-2 border-black px-4 py-2">Volume</th>
                <th className="border-2 border-black px-4 py-2">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-center">
              {filteredDetections.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-gray-500">
                    No trash detections found.
                  </td>
                </tr>
              ) : (
                filteredDetections.map((detection) => (
                  <tr className="border-2 border-black" key={detection._id}>
                    <td className="border-2 border-black px-4 py-2 text-blue-600 underline">
                      <a href={detection.image_path} target="_blank" rel="noopener noreferrer">
                        {detection.image_path.split("/").pop()}
                      </a>
                    </td>
                    <td className="border-2 border-black px-4 py-2">
                      {new Date(detection.timestamp).toLocaleString()}
                    </td>
                    <td className="border-2 border-black px-4 py-2 capitalize">
                      {detection.volume}
                    </td>
                    <td className="border-2 border-black px-4 py-2">
                      {detection.confidence}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
