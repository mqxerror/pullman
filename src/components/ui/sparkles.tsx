"use client";
import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SparklesCoreProps = {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  speed?: number;
};

export const SparklesCore = (props: SparklesCoreProps) => {
  const {
    id,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 100,
    className,
    particleColor = "#FFF",
    speed = 1,
  } = props;

  const generatedId = useId();
  const sparkleId = id || generatedId;

  const particles = useMemo(() => {
    return Array.from({ length: particleDensity }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: (Math.random() * 2 + 1) / speed,
      delay: Math.random() * 2,
    }));
  }, [particleDensity, maxSize, minSize, speed]);

  return (
    <div
      className={cn("h-full w-full", className)}
      style={{
        background,
      }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`sparkle-gradient-${sparkleId}`}>
            <stop offset="0%" stopColor={particleColor} stopOpacity="1" />
            <stop offset="100%" stopColor={particleColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={`url(#sparkle-gradient-${sparkleId})`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};
