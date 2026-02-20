import { fetchPageContent, FALLBACK_CONTENT } from "@/lib/content-fetch";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import CommunityInitiativesSection from "./CommunityInitiativesSection";

export default async function HomeContentSections() {
  const content = await fetchPageContent();
  const data = content ?? FALLBACK_CONTENT;

  return (
    <>
      <HeroSection hero={data.hero} />
      <AboutSection about={data.about} leaderName={data.hero.title} />
      <CommunityInitiativesSection initiatives={data.initiatives} />
    </>
  );
}
