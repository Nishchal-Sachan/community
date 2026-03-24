"use client";

import { useState } from "react";
import { services } from "@/data/services";

function DividerWithDots() {
  return (
    <div
      className="relative mx-auto mb-[60px] mt-5 w-[120px]"
      aria-hidden="true"
    >
      <div className="h-px w-full bg-[#cccccc]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-gradient-to-br from-orange-50 via-white to-orange-100 px-0.5">
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
      </div>
    </div>
  );
}

export default function OurServicesSection() {
  const [activeService, setActiveService] = useState("matrimony");
  const [activeIndex, setActiveIndex] = useState(0);

  const active = services.find((s) => s.id === activeService) ?? services[0];

  return (
    <section
      id="services"
      className="bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6 py-20 lg:px-16"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        <p className="text-center font-body text-[12px] uppercase tracking-[3px] text-[#F57C00]">
          हमसे जुड़ें
        </p>

        <h2
          id="services-heading"
          className="mt-[10px] text-center font-heading text-[48px] font-bold leading-tight text-gray-900"
        >
          🛠️ हमारी सेवाएं
        </h2>

        <p className="mx-auto mt-5 max-w-[900px] text-center font-body text-[15px] leading-[1.9] text-[#555555]">
          अखिल भारतीय कुशवाहा महासभा समाज के सर्वांगीण विकास हेतु विभिन्न सेवाएं प्रदान करती है, जिनका उद्देश्य हर वर्ग को सहयोग, अवसर और सशक्तिकरण देना है।
        </p>

        <DividerWithDots />

        {/* Mobile: Accordion */}
        <div className="space-y-3 md:hidden">
          {services.map((service, index) => (
            <div key={service.id} className="overflow-hidden rounded-xl bg-white shadow-md">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(activeIndex === index ? -1 : index)
                }
                className={`flex w-full items-center justify-between rounded-xl px-4 py-4 text-left font-body transition-all duration-300 ${
                  activeIndex === index
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-3 font-medium">
                  <span className="text-xl" aria-hidden>
                    {service.icon}
                  </span>
                  {service.title}
                </span>
                <span className="text-lg font-medium" aria-hidden>
                  {activeIndex === index ? "−" : "+"}
                </span>
              </button>
              {activeIndex === index && (
                <div className="rounded-b-xl bg-gray-50 p-4 font-body text-sm text-gray-700 transition-all duration-300">
                  <p className="mb-3">{service.description}</p>
                  <ul className="space-y-2">
                    {service.points.map((point, i) => {
                      const text = point.replace(/^✔️\s*/, "");
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 text-green-500">✔</span>
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: Left categories + right content */}
        <div className="hidden gap-10 md:grid md:grid-cols-2 lg:grid-cols-[320px_1fr]">
          {/* Left: Rich sidebar */}
          <div className="h-fit space-y-3 rounded-2xl bg-white p-4 shadow-lg lg:sticky lg:top-24">
            <div className="mb-4 px-2">
              <h3 className="font-heading font-semibold text-gray-800">
                सेवाओं की सूची
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                अपनी आवश्यक सेवा चुनें
              </p>
            </div>

            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setActiveService(service.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 font-body transition-all duration-300 ${
                  activeService === service.id
                    ? "scale-[1.02] bg-orange-500 text-white shadow-md"
                    : "bg-gray-50 hover:translate-x-1 hover:bg-orange-50"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {service.icon}
                </span>
                <span className="font-medium">{service.title}</span>
              </button>
            ))}

            <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm text-gray-700">
              <p className="font-body">👥 10,000+ सदस्य जुड़े</p>
              <p className="mt-1 font-body">💼 500+ रोजगार अवसर</p>
              <p className="mt-1 font-body">🎓 200+ छात्र सहायता</p>
            </div>
          </div>

          {/* Right: Dynamic content */}
          <div className="min-h-[300px]">
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="mb-3 font-heading text-2xl font-bold text-gray-800">
                {active.title}
              </h2>
              <p className="mb-6 font-body leading-relaxed text-gray-600">
                {active.description}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {active.points.map((point, i) => {
                  const text = point.replace(/^✔️\s*/, "");
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 font-body text-gray-700"
                    >
                      <span className="mt-0.5 shrink-0 text-green-500">✔</span>
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-xl border border-orange-100 bg-orange-50 p-5">
                <h4 className="mb-2 font-heading font-semibold text-gray-800">
                  हमारा उद्देश्य
                </h4>
                <p className="font-body text-sm text-gray-600">
                  हम समाज के प्रत्येक व्यक्ति तक अवसर, सहयोग और सशक्तिकरण पहुँचाने के लिए प्रतिबद्ध हैं।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
