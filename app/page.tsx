import FullWidthCTASection from "./_components/FullWidthCTASection";
import Footer from "./_components/Footer";
import HeroSection from "./_components/HeroSection";
import HomepageServicesSection from "./_components/HomepageServicesSection";
import LeadershipSection from "./_components/LeadershipSection";
import LeadershipTeamSection from "./_components/LeadershipTeamSection";
import OurGoalSection from "./_components/OurGoalSection";
import {
  ctaSlidesFromContent,
  getMergedSiteContent,
  heroForBanner,
  leadershipCardsFromContent,
  servicesFromContent,
} from "@/lib/get-site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getMergedSiteContent();
  const hero = heroForBanner(content.hero);
  const ctaSlides = ctaSlidesFromContent(content.cta);
  const leadershipCms = leadershipCardsFromContent(content.leadership);
  const services = servicesFromContent(content.services);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <HeroSection hero={hero} />

      <LeadershipSection />

      <LeadershipTeamSection cmsCards={leadershipCms} />

      <OurGoalSection />

      <HomepageServicesSection
        title={services.title}
        descriptions={services.descriptions}
      />

      <FullWidthCTASection slides={ctaSlides} />

      <Footer />
    </main>
  );
}
