import { Suspense } from "react";
import HomeContentSections from "./_components/HomeContentSections";
import Footer from "./_components/Footer";
import FullWidthCTASection from "./_components/FullWidthCTASection";
import LeadershipSection from "./_components/LeadershipSection";
import LeadershipTeamSection from "./_components/LeadershipTeamSection";
import OurGoalSection from "./_components/OurGoalSection";
import OurServicesSection from "./_components/OurServicesSection";

function HeroLoadingFallback() {
  return (
    <div className="flex h-[90vh] min-h-[22rem] w-full items-center bg-secondary">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="h-12 w-4/5 max-w-md animate-pulse rounded-md bg-on-primary/20 md:h-16" />
          <div className="h-6 w-full max-w-lg animate-pulse rounded-md bg-on-primary/15 md:h-7" />
          <div className="h-10 w-40 animate-pulse rounded-md bg-primary/40" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Suspense fallback={<HeroLoadingFallback />}>
        <HomeContentSections />
      </Suspense>

      <LeadershipSection />

      <LeadershipTeamSection />

      <OurGoalSection />

      <OurServicesSection />

      <FullWidthCTASection />

      <Suspense fallback={<div className="h-64 bg-gray-950" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
