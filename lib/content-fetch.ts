async function getBaseUrl(): Promise<string> {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  } catch {
    return "http://localhost:3000";
  }
}

export interface PageContentData {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage: string;
  };
  about: {
    bio: string;
    leaderImage: string;
  };
  initiatives: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export async function fetchPageContent(): Promise<PageContentData | null> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/content`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const content = json?.content;
    if (!content || typeof content !== "object") return null;
    return content as PageContentData;
  } catch {
    return null;
  }
}

export const FALLBACK_CONTENT: PageContentData = {
  hero: {
    title: "Sarah Martinez",
    subtitle: "Serving the Community with Integrity and Vision",
    ctaText: "Join Community",
    backgroundImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
  },
  about: {
    bio: "For over twelve years, I have had the privilege of serving our community—first as a school board member, then as a city council representative. My work has centered on education reform, infrastructure upgrades, and youth empowerment programs that give every child a fair start. I believe that strong schools, safe streets, and well-maintained public spaces are the foundation of a thriving neighborhood.\n\nTransparency and accountability are non-negotiable. Every decision I make is informed by resident input, public data, and a commitment to doing what is right for the long term—not just what is convenient. I invite you to hold me to that standard.",
    leaderImage:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop",
  },
  initiatives: [
    { title: "Youth Development Programs", description: "Supporting skill-building workshops and mentorship initiatives.", icon: "academic" },
    { title: "Women Empowerment", description: "Promoting entrepreneurship and financial literacy programs.", icon: "users" },
    { title: "Infrastructure Improvement", description: "Roads, sanitation, and public facilities upgrades.", icon: "tools" },
    { title: "Health & Awareness Drives", description: "Free medical camps and wellness awareness campaigns.", icon: "heart" },
  ],
};
