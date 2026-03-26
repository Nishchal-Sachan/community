import type { SiteSectionKey } from "@/lib/models/SiteContent";

/** Default payloads merged with DB `SiteContent` documents. */
export const SITE_CONTENT_DEFAULTS: Record<SiteSectionKey, Record<string, unknown>> = {
  hero: {
    heading: "अखिल भारतीय कुशवाहा महासभा",
    subheading: "शिक्षा, स्वास्थ्य और सम्मान — कुशवाहा समाज बने महान",
    buttonText: "समुदाय से जुड़ें",
    backgroundImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
  },
  cta: {
    slides: [
      {
        id: "slide-1",
        image:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=900&fit=crop&q=80",
        heading: "अपने समुदाय को बदलें, देश को बदलें",
        buttonText: "आज ही जुड़ें",
      },
      {
        id: "slide-2",
        image:
          "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&h=900&fit=crop&q=80",
        heading: "बदलाव की ओर कदम बढ़ाएं — ABKM से जुड़कर आत्मनिर्भर भारत का निर्माण करें",
        buttonText: "शुरू करें",
      },
    ],
  },
  leadership: {
    cards: [
      {
        name: "उदाहरण नाम",
        role: "अध्यक्ष",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      },
    ],
  },
  home_images: {
    images: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
    ],
  },
  gallery: {
    /** Each entry: `{ id, imageUrl, title?, category?, albumId? }` */
    items: [] as Array<Record<string, unknown>>,
  },
  /** Public impact section / GET /api/stats — `educationSupport` is admin-controlled display count */
  impact: {
    educationSupport: 0,
  },
};
