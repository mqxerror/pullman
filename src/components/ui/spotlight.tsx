"use client";
import { cn } from "@/lib/utils";
import React from "react";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export const Spotlight = React.memo(({ className, fill }: SpotlightProps) => {
  // Skip rendering entirely if user prefers reduced motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      // Reduced viewBox by 50% for better performance
      viewBox="0 0 1894 1421"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          // Scaled down ellipse proportionally
          cx="962"
          cy="137"
          rx="962"
          ry="137"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 1816 1146)"
          fill={fill || "white"}
          fillOpacity="0.21"
        ></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0"
          y="0"
          width="1894"
          height="1421"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          {/* Reduced blur from 151 to 50 for much better performance */}
          <feGaussianBlur
            stdDeviation="50"
            result="effect1_foregroundBlur_1065_8"
          ></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
});

Spotlight.displayName = "Spotlight";
