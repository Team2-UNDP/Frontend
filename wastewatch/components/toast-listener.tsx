"use client";
import { useState, useEffect, useRef } from "react";
import Toast from "./toast-component";
import { getSocket } from "@/utils/socket";
import { Howl } from "howler";

export default function NotificationListener() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const notificationSoundRef = useRef<Howl | null>(null);

  // Initialize sound once
  useEffect(() => {
    notificationSoundRef.current = new Howl({
      src: ["/sound/notification.mp3"],
      volume: 1.0,
      preload: true,
      html5: true,
    });

    const unlockAudio = () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.play();
        notificationSoundRef.current.stop(); // unlock the sound
      }
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  // WebSocket listener
  useEffect(() => {
    const socket = getSocket();

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.detection_type === "summary_alert") {
            console.log("📡 New WebSocket Notification:", data);
          setToastMessage(data.message || "Trash detection alert 🔔");
          setShowToast(true);

          if (notificationSoundRef.current) {
            notificationSoundRef.current.stop(); // stop any currently playing instance
            notificationSoundRef.current.play();
          }

          setTimeout(() => setShowToast(false), 5000);
        }
      } catch (error) {
        console.error("Toast listener parse error:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, []);

  return showToast ? (
    <Toast message={toastMessage} onClose={() => setShowToast(false)} />
  ) : null;
}
