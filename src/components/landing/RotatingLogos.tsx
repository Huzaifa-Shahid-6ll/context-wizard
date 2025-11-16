"use client";

import { useState, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";

interface RotatingLogosProps {
  logos: string[];
}

export function RotatingLogos({ logos }: RotatingLogosProps) {
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  useEffect(() => {
    if (!isPaused) {
      controls.start({
        x: ["0%", "-50%"],
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 30,
          ease: "linear",
        },
      });
    } else {
      controls.stop();
    }
  }, [isPaused, controls]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex items-center gap-6"
        animate={controls}
      >
        {duplicatedLogos.map((logo, index) => (
          <motion.div
            key={`${logo}-${index}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border/40 whitespace-nowrap shrink-0"
            whileHover={{ scale: 1.15, zIndex: 10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xs font-semibold text-foreground/70">{logo}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

