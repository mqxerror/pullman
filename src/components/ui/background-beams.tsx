"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useMemo } from "react";

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export const BackgroundBeams = React.memo(
  ({ className }: { className?: string }) => {
    // Reduced from 20 paths to 5 for performance (75% reduction in animations)
    const paths = useMemo(() => [
      "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
      "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
      "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
      "M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755",
      "M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723",
    ], []);
    return (
      <div
        className={cn(
          "absolute h-full w-full inset-0 [mask-size:40px] [mask-repeat:no-repeat] flex items-center justify-center",
          className
        )}
      >
        <svg
          className="z-0 h-full w-full pointer-events-none absolute"
          width="100%"
          height="100%"
          viewBox="0 0 696 316"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
            stroke="url(#paint0_radial_242_278)"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          ></path>
          {paths.map((path, index) => (
            <motion.path
              key={`path-` + index}
              d={path}
              stroke={`url(#linearGradient-${index})`}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            ></motion.path>
          ))}
          <defs>
            {/* Skip animations if user prefers reduced motion */}
            {paths.map((_, index) => (
              prefersReducedMotion ? (
                <linearGradient
                  id={`linearGradient-${index}`}
                  key={`gradient-${index}`}
                  x1="0%"
                  x2="100%"
                  y1="0%"
                  y2="100%"
                >
                  <stop stopColor="#d4af37" stopOpacity="0"></stop>
                  <stop stopColor="#d4af37"></stop>
                  <stop offset="32.5%" stopColor="#c9a227"></stop>
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0"></stop>
                </linearGradient>
              ) : (
                <motion.linearGradient
                  id={`linearGradient-${index}`}
                  key={`gradient-${index}`}
                  initial={{
                    x1: "0%",
                    x2: "0%",
                    y1: "0%",
                    y2: "0%",
                  }}
                  animate={{
                    x1: ["0%", "100%"],
                    x2: ["0%", "95%"],
                    y1: ["0%", "100%"],
                    y2: ["0%", "97%"],
                  }}
                  transition={{
                    duration: 15 + index * 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: index * 2,
                  }}
                >
                  <stop stopColor="#d4af37" stopOpacity="0"></stop>
                  <stop stopColor="#d4af37"></stop>
                  <stop offset="32.5%" stopColor="#c9a227"></stop>
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0"></stop>
                </motion.linearGradient>
              )
            ))}
            <radialGradient
              id="paint0_radial_242_278"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
            >
              <stop offset="0.0666667" stopColor="#d4af37"></stop>
              <stop offset="0.243243" stopColor="#d4af37"></stop>
              <stop offset="0.43594" stopColor="white" stopOpacity="0"></stop>
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }
);

BackgroundBeams.displayName = "BackgroundBeams";
