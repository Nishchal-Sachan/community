"use client";

import LeadershipSlider from "@/components/LeadershipSlider";
import type { LeadershipCard } from "@/lib/site-content-types";

type Props = {
  cmsCards: LeadershipCard[] | null;
  /** Omit outer section + titles; use under an existing heading (e.g. Who We Are). */
  embedded?: boolean;
};

export default function LeadershipCmsSliderSection({
  cmsCards,
  embedded = false,
}: Props) {
  const hasCards = Boolean(cmsCards?.length);

  if (!hasCards) {
    if (embedded) {
      return (
        <p
          role="status"
          className="mt-10 max-w-2xl font-body text-[15px] leading-relaxed text-gray-500"
        >
          कोई नेतृत्वकर्ता उपलब्ध नहीं हैं
        </p>
      );
    }
    return null;
  }

  const leaders = cmsCards!;

  if (embedded) {
    return (
      <div
        className="mx-auto mt-10 w-full max-w-[960px]"
        data-slot="leadership-cms-carousel"
      >
        <LeadershipSlider leaders={leaders} ariaLabel="नेतृत्व स्लाइडर" />
      </div>
    );
  }

  return (
    <section
      id="leadership-team"
      className="border-t border-gray-200 bg-gray-50 pt-16 pb-24"
      aria-labelledby="leadership-cms-slider-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-[#F57C00]">
            नेतृत्व टीम
          </p>
          <h2
            id="leadership-cms-slider-heading"
            className="font-heading text-3xl font-bold text-gray-800 md:text-4xl"
          >
            हमारे नेतृत्वकर्ता
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-[15px] leading-relaxed text-gray-600">
            संगठन के विभिन्न स्तरों पर कार्यरत हमारे सम्मानित पदाधिकारी, जो समाज के विकास और सशक्तिकरण के लिए निरंतर कार्य कर रहे हैं।
          </p>
        </div>

        <LeadershipSlider
          leaders={leaders}
          ariaLabelledBy="leadership-cms-slider-heading"
        />
      </div>
    </section>
  );
}
