import React from "react";
import Image from "next/image";

interface BuoyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buoyData: {
    name: string;
    status: string;
    lat: number;
    long: number;
    installationDate: string;
    lastMaintenance: string;
    battery: number;
    lastCharged: string;
  };
}

const BuoyDetailsModal: React.FC<BuoyDetailsModalProps> = ({ isOpen, onClose, buoyData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-1000">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-full transition duration-150 cursor-pointer"
        >
          <Image src="/icons/Close.png" alt="Close" width={12} height={12} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Details</h2>
        <p>
          <strong>Name:</strong> {buoyData.name}
        </p>
        <p>
          <strong>Status:</strong> {buoyData.status}
        </p>
        <p>
          <strong>Lat:</strong> {buoyData.lat}
        </p>
        <p>
          <strong>Long:</strong> {buoyData.long}
        </p>
        <p>
          <strong>Installed on:</strong> {buoyData.installationDate}
        </p>
        <p>
          <strong>Last Maintenance:</strong> {buoyData.lastMaintenance}
        </p>
        <p>
          <strong>Battery:</strong> {buoyData.battery}%
        </p>
        <p>
          <strong>Last Charged:</strong> {buoyData.lastCharged}
        </p>
      </div>
    </div>
  );
};

export default BuoyDetailsModal;