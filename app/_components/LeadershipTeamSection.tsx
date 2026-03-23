"use client";

import Image from "next/image";
import { useState } from "react";
import { leadershipTeam } from "@/data/leadershipTeam";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function LeadershipTeamSection() {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section id="leadership-team" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-16 text-center">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-[#F57C00]">
            Leadership Team
          </p>
          <h2 className="font-heading text-3xl font-bold text-gray-800 md:text-4xl">
            हमारे नेतृत्वकर्ता
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-[15px] leading-relaxed text-gray-600">
            संगठन के विभिन्न स्तरों पर कार्यरत हमारे सम्मानित पदाधिकारी, जो समाज के विकास और सशक्तिकरण के लिए निरंतर कार्य कर रहे हैं।
          </p>
        </div>

        {/* GRID */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {leadershipTeam.map((leader, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                leader.primary
                  ? "md:col-span-2 lg:col-span-1 lg:scale-[1.05]"
                  : ""
              }`}
            >
              {/* HOVER BACKGROUND EFFECT */}
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />

              {/* IMAGE */}
              <div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-orange-100 transition-colors duration-300 group-hover:border-orange-400">
                {imageErrors[index] ? (
                  <div
                    className="flex h-full w-full items-center justify-center bg-orange-100 font-heading text-3xl font-bold text-orange-500"
                    aria-hidden
                  >
                    {getInitials(leader.name)}
                  </div>
                ) : (
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="160px"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>

              {/* NAME */}
              <h3 className="relative font-heading text-xl font-bold text-gray-800">
                {leader.name}
              </h3>

              {/* ROLE */}
              <p className="relative mt-2 font-body text-base font-medium text-[#F57C00]">
                {leader.role}
              </p>

              {/* DECOR LINE */}
              <div
                className="relative mx-auto mt-4 h-[3px] w-12 rounded bg-[#F57C00]"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
