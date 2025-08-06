// components/Modal.tsx

import React from "react";

interface ModalProps {
  message: string;
  onClose: () => void;
}

export default function Modal({ message, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="text-white p-8 rounded-xl shadow-lg w-96 relative bg-gradient-to-bl from-[rgba(146,240,255,0.2)] to-[rgba(2,36,50,0.2)] border border-[#ACDCFF] backdrop-blur-sm">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-white hover:text-gray-300 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-[#E1E6E8]">
          Notification
        </h2>
        <p className="text-[#E1E6E8] text-center text-sm">{message}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-[#FDFDFD] text-[#001623] py-2 px-6 rounded-full font-semibold hover:bg-gray-300 transform transition duration-150 active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
