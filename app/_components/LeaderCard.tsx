"use client";

import Image from "next/image";
import { useState } from "react";
import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import type { Leader } from "@/data/leaders";

interface LeaderCardProps {
  leader: Leader;
  parallaxY?: MotionValue<number>;
}

export function LeaderCard({ leader, parallaxY }: LeaderCardProps) {
  const [imageError, setImageError] = useState(false);

  const containerClass =
    "absolute inset-0 overflow-hidden rounded-2xl group";

  return (
    <div className="relative min-h-100 overflow-hidden rounded-2xl md:min-h-130">
      {!imageError ? (
        parallaxY ? (
          <motion.div
            className={containerClass}
            style={{ y: parallaxY }}
          >
          <Image
            src={leader.image}
            alt={leader.name}
            fill
            quality={100}
            priority
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
            onError={() => setImageError(true)}
          />
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
            aria-hidden
          />
          <div
            className="absolute bottom-6 left-6 z-10 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]"
          >
            <p className="text-lg font-semibold leading-snug md:text-xl">
              सभी के लिए आर्थिक सशक्तिकरण,
              <br />
              ताकि कोई पीछे न छूटे।
            </p>
            <span className="mt-2 block text-sm opacity-80">
              — Rakesh Mahto
            </span>
          </div>
        </motion.div>
        ) : (
          <div className={containerClass}>
            <Image
              src={leader.image}
              alt={leader.name}
              fill
              quality={100}
              priority
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
              onError={() => setImageError(true)}
            />
            <div
              className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
              aria-hidden
            />
            <div
              className="absolute bottom-6 left-6 z-10 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]"
            >
              <p className="text-lg font-semibold leading-snug md:text-xl">
                सभी के लिए आर्थिक सशक्तिकरण,
                <br />
                ताकि कोई पीछे न छूटे।
              </p>
              <span className="mt-2 block text-sm opacity-80">
                — Rakesh Mahto
              </span>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="absolute inset-0 rounded-2xl bg-black/80" aria-hidden />
          <div
            className="absolute bottom-6 left-6 z-10 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]"
          >
            <p className="text-lg font-semibold leading-snug md:text-xl">
              सभी के लिए आर्थिक सशक्तिकरण,
              <br />
              ताकि कोई पीछे न छूटे।
            </p>
            <span className="mt-2 block text-sm opacity-80">
              — Rakesh Mahto
            </span>
          </div>
        </>
      )}
    </div>
  );
}
