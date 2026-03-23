"use client";

import { useCallback, useId, useState } from "react";

const HINDI_PARAGRAPH =
  "उत्कृष्टता के पाँच स्तंभ — जो हमारे कार्यक्रमों, साझेदारी और सार्वजनिक प्रतिबद्धताओं की दिशा तय करते हैं। हम सदस्यों के लिए कानूनी, वित्तीय और सामाजिक सुरक्षा के बुनियादी ढाँचे तैयार करते हैं। जुड़ाव ही ताकत है: city chapters, district meets, और digital groups के ज़रिए हम पहचान और सहयोग का नेटवर्क बढ़ाते हैं। आजीविका, स्वास्थ्य, शिक्षा और बुज़ुर्गों की देखभाल — एक समेकित सुरक्षा का चित्र। सम्मान प्रेरणा को जगाता है। विकास निरंतर है: skills, leadership pipelines, और नई पीढ़ी के लिए मार्ग।";

const HINDI_HEADINGS =
  "पूर्ण संरक्षण, सामाजिक आधार, आर्थिक आधार, राजनैतिक आधार\nपूर्ण समर्पण, प्रचार, प्रसार";

const LEADER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=440&h=440&fit=crop";
const RIGHT_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=440&fit=crop";

const PILLARS = [
  {
    id: "full-protection",
    title: "Full Protection",
    body: "हम सदस्यों के लिए कानूनी, वित्तीय और सामाजिक सुरक्षा के बुनियादी ढाँचे तैयार करते हैं — We build the legal, financial, and social scaffolding so members are not left alone when disputes, emergencies, or administrative hurdles arise. From documentation support to liaison with trusted advisors, the goal is comprehensive cover—पूर्ण संरक्षण—across urban and rural settings.",
  },
  {
    id: "social-networking",
    title: "Social Networking",
    body: "जुड़ाव ही ताकत है: city chapters, district meets, और digital groups के ज़रिए हम पहचान और सहयोग का नेटवर्क बढ़ाते हैं — Connection is strength: we grow identity and cooperation through chapters, district gatherings, and moderated online spaces. These networks help share opportunities, celebrate achievements, and mobilise quickly for community causes.",
  },
  {
    id: "socio-economic-security",
    title: "Socio-Economic Security Net",
    body: "आजीविका, स्वास्थ्य, शिक्षा और बुज़ुर्गों की देखभाल — Livelihoods, health, education, and dignity in later life form one integrated picture of security. Programmes emphasise stable income paths, insurance awareness, and family resilience so socio-economic shocks are absorbed, not amplified.",
  },
  {
    id: "awards-recognition",
    title: "Awards, Recognitions and Training",
    body: "सम्मान प्रेरणा को जगाता है — Public recognition honours those who serve without fanfare, from grassroots volunteers to institutional partners. State and national-level citations, citations in publications, and fellowship-style titles reinforce a culture where seva and excellence are visible and celebrated. Training programmes complement recognition with skill-building opportunities.",
  },
  {
    id: "growth-development",
    title: "Growth & Development",
    body: "विकास निरंतर है: skills, leadership pipelines, और नई पीढ़ी के लिए मार्ग — Development is continuous—through skills, leadership pipelines, and clear pathways for youth. We align training with Digital India tools, local industry needs, and the long-term expansion of the organisation so growth is both personal and collective.",
  },
  {
    id: "committees",
    title: "Committees Aligned with Indian Ministries",
    body: "We structure our working committees to align with key central and state ministries—rural development, MSME, labour, education, and social justice. This ensures our advocacy, programmes, and representation speak directly to policy frameworks and enable effective coordination with government initiatives.",
  },
] as const;

function DividerWithDots() {
  return (
    <div className="relative mx-auto my-5 w-[120px]" aria-hidden="true">
      <div className="h-px w-full bg-[#cccccc]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-white px-0.5">
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

export default function PillarsSection() {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <section
      id="pillars-excellence"
      className="bg-[#ffffff] py-[100px]"
      aria-labelledby="pillars-title"
    >
      <div className="px-4 sm:px-6">
        <p className="text-center font-body text-[12px] uppercase tracking-[3px] text-[#888888]">
          EXCELLENCE
        </p>

        <h2
          id="pillars-title"
          className="mt-[10px] text-center font-heading text-[44px] font-bold leading-tight text-gray-900"
        >
          Our Pillars of Excellence
        </h2>

        <DividerWithDots />

        <div className="mt-2.5 text-center font-body text-[18px] text-gray-800">
          {HINDI_HEADINGS.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {line}
            </p>
          ))}
        </div>

        <div className="mx-auto mt-[60px] grid max-w-[1200px] grid-cols-1 gap-[15px] lg:grid-cols-2 lg:gap-[60px]">
          {/* Left: Rich content block */}
          <div>
            <p className="font-body text-[15px] leading-[1.9] text-[#444444]">
              {HINDI_PARAGRAPH}
            </p>

            {/* Image layout: leader + logo + right image */}
            <div className="relative mt-[30px] flex items-center gap-5">
              <img
                src={LEADER_IMAGE}
                alt=""
                className="h-[220px] w-[220px] shrink-0 rounded-[12px] object-cover"
              />
              {/* Center logo — overlaps both images */}
              <div
                className="absolute left-[210px] top-1/2 flex size-[100px] -translate-y-1/2 shrink-0 items-center justify-center rounded-full bg-white p-2.5 shadow-[0_5px_20px_rgba(0,0,0,0.2)]"
                aria-hidden
              >
                <span className="text-center font-heading text-lg font-bold text-[#F57C00]">
                  ABKM
                </span>
              </div>
              <img
                src={RIGHT_IMAGE}
                alt=""
                className="h-[220px] w-[300px] shrink-0 rounded-[12px] object-cover"
              />
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="flex flex-col gap-[15px]">
            {PILLARS.map((pillar) => {
              const isOpen = openId === pillar.id;
              const headerId = `${baseId}-${pillar.id}-header`;
              const panelId = `${baseId}-${pillar.id}-panel`;

              return (
                <div
                  key={pillar.id}
                  className={`rounded-[10px] transition-colors ${
                    isOpen ? "bg-[#F57C00] text-white" : "bg-[#f5f5f5]"
                  }`}
                >
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(pillar.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-[18px] text-left font-body text-[16px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0">{pillar.title}</span>
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden" aria-hidden={!isOpen}>
                      <div
                        className={`px-5 pb-[18px] pt-0 font-body text-[14px] leading-[1.7] ${
                          isOpen ? "text-white/95" : "text-gray-600"
                        }`}
                        style={{ marginTop: 10 }}
                      >
                        {pillar.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
