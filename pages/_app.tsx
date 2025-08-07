import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "leaflet/dist/leaflet.css";
import NotificationListener from "@/components/toast-listener";
import Head
 from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gradient-to-br from-[#065C7C] to-[#0C2E3F] min-h-screen font-poppins">
      <Head>
        <link rel="icon" href="/images/wastewatch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="WasteWatch" />
        <meta name="theme-color" content="#065C7C" />
        <title>WasteWatch</title>
      </Head>
      <NotificationListener />
      <Component {...pageProps} />
    </div>
  );
}
