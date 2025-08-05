// utils/socket.ts
let socket: WebSocket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/notifications`); // Example: "ws://localhost:8000/ws"
  }
  return socket;
};
