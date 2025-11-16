"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextType from "@/components/TextType";

interface AnimatedHeadingProps {
  className?: string;
}

export function AnimatedHeading({ className = "" }: AnimatedHeadingProps) {
  const [currentWord, setCurrentWord] = useState<"App" | "Empires" | "Prompts" | null>(null);
  const [textTypeComplete, setTextTypeComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Watch for when "Make Great" is fully typed and trigger completion after pauseDuration
  useEffect(() => {
    // Calculate approximate time: "Make Great" = 10 chars
    // With variableSpeed { min: 60, max: 120 }, average is ~90ms per char
    // Max time to be safe: 10 * 120 = 1200ms, plus 1500ms pause = 2700ms
    const maxTypingTime = 10 * 120; // 10 characters * max 120ms
    const totalTime = maxTypingTime + 1500; // max typing + pauseDuration = 2700ms
    
    completionTimerRef.current = setTimeout(() => {
      setTextTypeComplete(true);
      setShowCursor(false); // Hide cursor once typing is complete
    }, totalTime);

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!textTypeComplete) return;

    // Start with "App" when TextType completes
    setCurrentWord("App");

    // Sequence: App appears -> scrolls up -> Empires scrolls in -> stays -> scrolls up -> Prompts scrolls in and stays
    const timer1 = setTimeout(() => {
      setCurrentWord("Empires");
    }, 1500); // App stays for 1.5s before scrolling up

    const timer2 = setTimeout(() => {
      setCurrentWord("Prompts");
    }, 4000); // Empires stays for 2.5s (1.5s + 2.5s = 4s total)

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [textTypeComplete]);

  return (
    <h1 className={className}>
      <TextType
        text="Make Great"
        as="span"
        typingSpeed={75}
        pauseDuration={1500}
        deletingSpeed={50}
        cursorBlinkDuration={0.5}
        showCursor={showCursor}
        loop={false}
        variableSpeed={{ min: 60, max: 120 }}
        className="inline"
      />{" "}
      <span className="relative inline-block overflow-hidden align-top" style={{ minWidth: "140px", height: "1.2em" }}>
        <AnimatePresence mode="wait">
          {currentWord === "App" && (
            <motion.span
              key="App"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="inline-block whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              App
            </motion.span>
          )}
          {currentWord === "Empires" && (
            <motion.span
              key="Empires"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="inline-block whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              Empires
            </motion.span>
          )}
          {currentWord === "Prompts" && (
            <motion.span
              key="Prompts"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="inline-block whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              Prompts
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </h1>
  );
}

