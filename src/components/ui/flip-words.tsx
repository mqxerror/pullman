"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, duration, startAnimation]);

  // If user prefers reduced motion, render static text
  if (prefersReducedMotion) {
    return <span className={cn("z-10 inline-block relative text-left text-amber-500", className)}>{currentWord}</span>;
  }

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false);
      }}
    >
      <motion.span
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        exit={{
          opacity: 0,
          y: -20,
          position: "absolute",
        }}
        className={cn(
          "z-10 inline-block relative text-left text-amber-500",
          className
        )}
        key={currentWord}
      >
        {/* Simplified: Word-level animation only, removed letter-level for performance */}
        {currentWord.split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: wordIndex * 0.15,
              duration: 0.3,
            }}
            className="inline-block whitespace-nowrap"
          >
            {word}
            {wordIndex < currentWord.split(" ").length - 1 && <span>&nbsp;</span>}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};
