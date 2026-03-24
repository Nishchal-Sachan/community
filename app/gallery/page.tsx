import GalleryPageClient from "./GalleryPageClient";
import { getMergedSiteContent } from "@/lib/get-site-content";
import { normalizeGalleryItems } from "@/lib/gallery-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "गैलरी",
  description: "समाज गतिविधियों व आयोजनों की चित्र प्रदर्शनी।",
};

export default async function GalleryPage() {
  const content = await getMergedSiteContent();
  const items = normalizeGalleryItems(content.gallery);

  return <GalleryPageClient initialItems={items} />;
}
