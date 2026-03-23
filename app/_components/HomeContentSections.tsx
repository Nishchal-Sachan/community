import HeroSection from "./HeroSection";

/** Static hero content — no longer fetched from admin/DB. */
const HERO_CONTENT = {
  title: "Akhil Bhartiya Kushwaha Mahasabha",
  subtitle: "शिक्षा, स्वास्थ्य और सम्मान — कुशवाहा समाज बने महान",
  ctaText: "Join Community",
  backgroundImage:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
};

export default function HomeContentSections() {
  return <HeroSection hero={HERO_CONTENT} />;
}
