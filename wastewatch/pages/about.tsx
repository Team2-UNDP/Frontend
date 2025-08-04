import Image from "next/image";
import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#052C3A] to-[#0A4E65] text-white">
      {/* Navbar */}
        <Header />
      

      {/* Main Content */}
      <main className="px-6 md:px-20 py-16 max-w-5xl mx-auto text-white">
        <div className="text-center mb-12">
          <Image
            src="/images/wastewatch_logo_about.svg"
            alt="WasteWatch Title Logo"
            width={300}
            height={100}
            className="mx-auto"
          />
          <p className="text-lg mt-2 text-[#C9D6DE]">Your Waste on our Watch</p>
        </div>

        <section className="space-y-6 text-base leading-relaxed text-[#E1E6E8] text-justify">
          <p>
            <strong>WasteWatch</strong> is a pioneering initiative under the United Nations Development Programme (UNDP),
            designed to empower the people of Samal Island in protecting and preserving the Davao Gulf. This innovative
            project combines Internet of Things (IoT) technology and Artificial Intelligence (AI) to detect, monitor,
            and predict ocean trash accumulation in real time.
          </p>

          <p>
            Through the deployment of smart buoys equipped with sensors and cameras, WasteWatch continuously scans the
            waters for floating debris and marine litter. The data collected is transmitted to a central AI-powered web
            dashboard, where it is analyzed and visualized to identify critical trash zones. The system alerts users
            when waste levels surpass environmental safety thresholds, enabling timely cleanup actions and better
            resource planning.
          </p>

          <p>
            By leveraging cutting-edge technology for ocean sustainability, WasteWatch supports community-led
            environmental efforts, enhances marine conservation, and promotes a cleaner, healthier future for Samal and
            its neighboring coastal communities.
          </p>

          <p>
            Together, let’s safeguard our sea for the generations to come.
          </p>
        </section>
      </main>
    </div>
  );
}
