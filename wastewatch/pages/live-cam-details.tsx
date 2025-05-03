"use client"; // only if using the app directory

import { useRouter } from "next/router";
import Image from "next/image";
import Header from "@/components/header";

export default function LiveCamFullscreen() {
  const router = useRouter();

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
          <div className="flex gap-4 mr-2">
            <button>
              <Image
                src="/icons/Download.png"
                alt="Download"
                className="p-1.5 hover:bg-[#065C7C] rounded-full transition duration-150 cursor-pointer"
                width={32}
                height={32}
              />
            </button>
            <button>
              <Image
                src="/icons/Filter.png"
                alt="Filter"
                className="p-1.5 hover:bg-[#065C7C] rounded-full transition duration-150 cursor-pointer"
                width={32}
                height={32}
              />
            </button>
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
              {[1, 2, 3].map((_, i) => (
                <tr className="border-2 border-black" key={i}>
                  <td className="border-2 border-black px-4 py-2 text-blue-600 underline">
                    <a href="#">IMG_10.12.25_2123.jpg</a>
                  </td>
                  <td className="border-2 border-black px-4 py-2">
                    10/10/25 24-12-01 14:30:00
                  </td>
                  <td className="border-2 border-black px-4 py-2">Heavy</td>
                  <td className="border-2 border-black px-4 py-2">90%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
