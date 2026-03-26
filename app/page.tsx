import FullWidthCTASection from "./_components/FullWidthCTASection";
import Footer from "./_components/Footer";
import HeroSection from "./_components/HeroSection";
import LeadershipCmsSliderSection from "./_components/LeadershipCmsSliderSection";
import LeadershipSection from "./_components/LeadershipSection";
import OurGoalSection from "./_components/OurGoalSection";
import {
  ctaSlidesFromContent,
  getMergedSiteContent,
  heroForBanner,
  leadershipCardsFromContent,
} from "@/lib/get-site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getMergedSiteContent();
  const hero = heroForBanner(content.hero);
  const ctaSlides = ctaSlidesFromContent(content.cta);
  const leadershipCms = leadershipCardsFromContent(content.leadership);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <HeroSection hero={hero} />

      <LeadershipSection />

      <LeadershipCmsSliderSection cmsCards={leadershipCms} />

      <OurGoalSection />

      <FullWidthCTASection slides={ctaSlides} />

      <Footer />
    </main>
  );
}
