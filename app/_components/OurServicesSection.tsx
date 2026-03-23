"use client";

import { useState } from "react";

const TAB_ITEMS = [
  "Legal & Regulatory Protection",
  "Financial & Economic Protection",
  "Protection Against Market Disruptions",
  "Social & Welfare Protection",
  "Collective Power and Representation",
] as const;

type TabId = (typeof TAB_ITEMS)[number];

const TAB_CONTENT: Record<
  TabId,
  { title: string; subtitle: string; paragraph: string; image: string }
> = {
  "Legal & Regulatory Protection": {
    title: "Legal & Regulatory Protection",
    subtitle: "Supporting traders with legal awareness and compliance.",
    paragraph:
      "Provide guidance on documentation, filings, and compliance with local and national regulations. Facilitate coordination with legal advisors and promote awareness of rights and protective laws.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
  },
  "Financial & Economic Protection": {
    title: "Financial & Economic Protection",
    subtitle: "Strengthening traders with stability, access, and resilience.",
    paragraph:
      "Help traders access credit, insurance, and financial literacy programs. Provide workshops on budgeting and financial planning to ensure long-term economic stability.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
  },
  "Protection Against Market Disruptions": {
    title: "Protection Against Market Disruptions",
    subtitle: "Safeguarding businesses from external shocks.",
    paragraph:
      "Support traders during market disruptions by providing advisory, crisis management strategies, and collective support mechanisms.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
  },
  "Social & Welfare Protection": {
    title: "Social & Welfare Protection",
    subtitle: "Ensuring community well-being and support systems.",
    paragraph:
      "Organize health camps, welfare schemes, and emergency support initiatives to ensure community safety and resilience.",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop",
  },
  "Collective Power and Representation": {
    title: "Collective Power and Representation",
    subtitle: "Strengthening voice through unity.",
    paragraph:
      "Create a unified platform where traders can raise concerns, influence policies, and ensure fair representation.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
  },
};

const DEFAULT_TAB: TabId = "Financial & Economic Protection";

function SidebarIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`size-5 shrink-0 ${isActive ? "text-white" : "text-[#F57C00]"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 1.944A11.954 11.954 0 002.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0010 1.944z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DividerWithDots() {
  return (
    <div
      className="relative mx-auto mb-[60px] mt-5 w-[120px]"
      aria-hidden="true"
    >
      <div className="h-px w-full bg-[#cccccc]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-[#E6D3B3] px-0.5">
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
      </div>
    </div>
  );
}

export default function OurServicesSection() {
  const [activeTab, setActiveTab] = useState<TabId>(DEFAULT_TAB);
  const content = TAB_CONTENT[activeTab];

  return (
    <section
      id="services"
      className="w-full bg-[#E6D3B3] py-[100px]"
      aria-labelledby="services-heading"
    >
      <div className="px-4 sm:px-6">
        <p className="text-center font-body text-[12px] uppercase tracking-[3px] text-[#F57C00]">
          JOIN WITH US
        </p>

        <h2
          id="services-heading"
          className="mt-[10px] text-center font-heading text-[48px] font-bold leading-tight text-gray-900"
        >
          Explore Our Services
        </h2>

        <DividerWithDots />

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[350px_1fr] lg:gap-[40px]">
          {/* Left sidebar */}
          <nav
            className="flex flex-col gap-3"
            aria-label="Service categories"
          >
            {TAB_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                aria-pressed={activeTab === item}
                aria-current={activeTab === item ? "true" : undefined}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-4 text-left font-body text-[14px] font-medium transition-colors ${
                  activeTab === item
                    ? "bg-[#F57C00] text-white"
                    : "bg-[#f5f5f5] text-gray-900 hover:bg-[#ebebeb]"
                }`}
              >
                <SidebarIcon isActive={activeTab === item} />
                {item}
              </button>
            ))}
          </nav>

          {/* Right content panel */}
          <div
            className="rounded-md bg-white p-8 sm:p-10"
            role="region"
            aria-live="polite"
            aria-label={`Content for ${content.title}`}
          >
            <h3 className="mb-2.5 font-heading text-[28px] font-semibold text-gray-900">
              {content.title}
            </h3>
            <div className="h-1 w-10 bg-[#F57C00]" aria-hidden />
            <p className="mt-2.5 font-body text-[16px] font-semibold text-[#444444]">
              {content.subtitle}
            </p>
            <p className="mt-2.5 font-body text-[15px] leading-[1.8] text-[#555555]">
              {content.paragraph}
            </p>
            <img
              src={content.image}
              alt=""
              className="mt-5 w-full rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
