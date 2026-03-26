"use client";

import Image from "next/image";
import { useState } from "react";
import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";

export type LeaderCardLeader = {
  name: string;
  role: string;
  image: string;
};

interface LeaderCardProps {
  leader: LeaderCardLeader;
  parallaxY?: MotionValue<number>;
  /** Hindi attribution under the quote (e.g. "— राकेश महतो"). Defaults to em dash + leader.name */
  signatureLine?: string;
}

const DEFAULT_QUOTE = (
  <>
    सभी के लिए आर्थिक सशक्तिकरण,
    <br />
    ताकि कोई पीछे न छूटे।
  </>
);

export function LeaderCard({ leader, parallaxY, signatureLine }: LeaderCardProps) {
  const [imageError, setImageError] = useState(false);

  const attribution = signatureLine ?? `— ${leader.name}`;

  const containerClass =
    "absolute inset-0 overflow-hidden rounded-2xl group";

  const overlay = (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
        aria-hidden
      />
      <div
        className="absolute bottom-6 left-6 right-6 z-10 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] sm:right-auto"
      >
        <p className="text-lg font-semibold leading-snug md:text-xl">
          {DEFAULT_QUOTE}
        </p>
        <span className="mt-2 block text-sm opacity-80">{attribution}</span>
      </div>
    </>
  );

  const isLocalImage =
    leader.image.startsWith("/") || leader.image.startsWith("data:");

  const imageLayer =
    !imageError && isLocalImage ? (
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
    ) : !imageError ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={leader.image}
        alt={leader.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        onError={() => setImageError(true)}
      />
    ) : null;

  return (
    <div className="relative min-h-100 overflow-hidden rounded-2xl md:min-h-130">
      {!imageError ? (
        parallaxY ? (
          <motion.div className={containerClass} style={{ y: parallaxY }}>
            {imageLayer}
            {overlay}
          </motion.div>
        ) : (
          <div className={containerClass}>
            {imageLayer}
            {overlay}
          </div>
        )
      ) : (
        <>
          <div className="absolute inset-0 rounded-2xl bg-black/80" aria-hidden />
          <div className="absolute bottom-6 left-6 right-6 z-10 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] sm:right-auto">
            <p className="text-lg font-semibold leading-snug md:text-xl">
              {DEFAULT_QUOTE}
            </p>
            <span className="mt-2 block text-sm opacity-80">{attribution}</span>
          </div>
        </>
      )}
    </div>
  );
}
