"use client";

import { leadershipFocus } from "@/data/leadershipFocus";
import { leaders } from "@/data/leaders";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LeaderCard } from "./LeaderCard";

function DividerWithDots() {
  return (
    <div className="relative mx-auto mt-[30px] w-[100px]" aria-hidden="true">
      <div className="h-[1px] w-full bg-[#cccccc]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-white px-0.5">
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
      </div>
    </div>
  );
}

export default function LeadershipSection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      ref={ref}
      id="leadership"
      className="bg-[#ffffff] py-24"
      aria-labelledby="leadership-heading"
    >
      <div className="px-4 sm:px-6">
        <p className="text-center font-body text-[12px] uppercase tracking-[3px] text-[#F57C00]">
          VISION MISSION BHARAT
        </p>

        <h2
          id="leadership-heading"
          className="mt-[10px] text-center font-heading text-[42px] font-bold leading-tight text-[#222222]"
        >
          Leadership{leaders[0] ? ` by Shri ${leaders[0].name}` : ""}
        </h2>

        <p className="mx-auto my-5 max-w-[900px] text-center font-body text-base leading-[1.85] text-[#555555] sm:text-lg">
          Akhil Bhartiya Kushwaha Mahasabha is committed to uplifting every section of society through unity, empowerment, and equal opportunities. Under the leadership of Shri Rakesh Mahto, the organization focuses on education, employment, social justice, and community development across rural and urban India.
        </p>

        <div className="mb-[60px]">
          <DividerWithDots />
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-[1fr_2fr] md:gap-[40px]">
          {/* Left: Leader card(s) */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {leaders.map((leader) => (
              <LeaderCard key={leader.name} leader={leader} parallaxY={y} />
            ))}
          </motion.div>

          {/* Right: Service cards grid */}
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-[24px]">
            {leadershipFocus.map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <article
                  className="rounded-[10px] border border-[#eeeeee] bg-white p-6 transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:p-[24px]"
                >
                  <h3 className="mb-[10px] font-heading text-[18px] font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  <ul className="list-outside list-disc space-y-1 pl-5 font-body text-[14px] leading-[1.7] text-[#555555] marker:text-[#999]">
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
