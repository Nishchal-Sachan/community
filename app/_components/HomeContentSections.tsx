import { fetchPageContent, FALLBACK_CONTENT } from "@/lib/content-fetch";
import HeroSection from "./HeroSection";

/** Homepage: hero only. Full `PageContent` still fetched for future use / dashboard. */
export default async function HomeContentSections() {
  const content = await fetchPageContent();
  const data = content ?? FALLBACK_CONTENT;

  return <HeroSection hero={data.hero} />;
}
