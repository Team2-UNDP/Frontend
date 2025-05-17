import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "leaflet/dist/leaflet.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gradient-to-br from-[#065C7C] to-[#0C2E3F] min-h-screen font-poppins">
      <Component {...pageProps} />
    </div>
  );
}
