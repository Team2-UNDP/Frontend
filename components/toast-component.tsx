import React, { useEffect } from "react";
import ReactDOM from "react-dom";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const toast = (
    <div className="fixed top-6 right-6 z-[10000] max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto backdrop-blur-md bg-white/30 border border-white/50 text-black px-6 py-3 rounded-lg shadow-lg">
        <p className="font-semibold">{message}</p>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  const portalRoot = document.getElementById("toast-root");
  return portalRoot ? ReactDOM.createPortal(toast, portalRoot) : toast;
};

export default Toast;
