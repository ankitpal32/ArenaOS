import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { RoleStrip, OrganizerCTA } from "@/components/landing/RoleStrip";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <RoleStrip />
        <OrganizerCTA />
      </main>
      <Footer />
    </div>
  );
}
