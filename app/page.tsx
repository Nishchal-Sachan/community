import { Suspense } from "react";
import HeroSection from "./_components/HeroSection";
import AboutSection from "./_components/AboutSection";
import CommunityInitiativesSection from "./_components/CommunityInitiativesSection";
import EventsSection from "./_components/EventsSection";
import JoinSection from "./_components/JoinSection";
import MembersPreviewSection from "./_components/MembersPreviewSection";
import Footer from "./_components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Section 1 – Hero */}
      <Suspense
        fallback={
          <div className="flex min-h-[85vh] items-center justify-center bg-slate-800">
            <div className="h-12 w-64 animate-pulse rounded-lg bg-slate-700" />
          </div>
        }
      >
        <HeroSection />
      </Suspense>

      {/* Section 2 – About the Leader */}
      <Suspense fallback={<div className="h-80 animate-pulse bg-white" />}>
        <AboutSection />
      </Suspense>

      {/* Section 3 – Community Initiatives */}
      <CommunityInitiativesSection />

      {/* Section 4 – Upcoming Events */}
      <Suspense fallback={null}>
        <EventsSection />
      </Suspense>

      {/* Section 5 – Join Community Form */}
      <JoinSection />

      {/* Section 6 – Members Preview */}
      <Suspense fallback={null}>
        <MembersPreviewSection />
      </Suspense>

      {/* Section 7 – Footer */}
      <Suspense fallback={<div className="h-64 bg-slate-900" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
