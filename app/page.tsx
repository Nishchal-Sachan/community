import { Suspense } from "react";
import HomeContentSections from "./_components/HomeContentSections";
import EventsSection from "./_components/EventsSection";
import JoinSection from "./_components/JoinSection";
import MembersPreviewSection from "./_components/MembersPreviewSection";
import Footer from "./_components/Footer";

function HeroLoadingFallback() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-800">
      <div className="h-12 w-64 animate-pulse rounded-lg bg-slate-700" />
    </div>
  );
}

function AboutLoadingFallback() {
  return (
    <div className="flex min-h-[28rem] items-center justify-center bg-gray-50">
      <div className="h-64 w-full max-w-6xl animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}

function InitiativesLoadingFallback() {
  return (
    <div className="flex min-h-[24rem] items-center justify-center bg-slate-50">
      <div className="h-48 w-full max-w-6xl animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

function ContentLoadingFallback() {
  return (
    <>
      <HeroLoadingFallback />
      <AboutLoadingFallback />
      <InitiativesLoadingFallback />
    </>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Hero, About, Initiatives – fetched from GET /api/content */}
      <Suspense fallback={<ContentLoadingFallback />}>
        <HomeContentSections />
      </Suspense>

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
