"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function generateBoxShadowStars(n: number) {
  let value = "";
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    value += `${x}px ${y}px var(--star-color)${i < n - 1 ? ", " : ""}`;
  }
  return value;
}

export function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [smallStars, setSmallStars] = useState("");
  const [mediumStars, setMediumStars] = useState("");
  const [largeStars, setLargeStars] = useState("");

  const { scrollYProgress } = useScroll();
  const ySmall = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const yMedium = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const yLarge = useTransform(scrollYProgress, [0, 1], [0, -600]);

  useEffect(() => {
    setSmallStars(generateBoxShadowStars(700));
    setMediumStars(generateBoxShadowStars(200));
    setLargeStars(generateBoxShadowStars(100));
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-zinc-50 dark:bg-[#050510] transition-colors duration-500"
      style={
        { "--star-color": "rgba(100, 100, 100, 0.8)" } as React.CSSProperties
      }
    >
      <style jsx global>{`
        .dark {
          --star-color: #ffffff;
        }
      `}</style>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 dark:to-blue-900/20 z-10" />

      {/* Small Stars */}
      <motion.div
        className="absolute w-[1px] h-[1px] bg-transparent rounded-full"
        style={{ boxShadow: smallStars, y: ySmall }}
      />

      {/* Medium Stars */}
      <motion.div
        className="absolute w-[2px] h-[2px] bg-transparent rounded-full"
        style={{ boxShadow: mediumStars, y: yMedium }}
      />

      {/* Large Stars (Planets/Bright Stars) */}
      <motion.div
        className="absolute w-[3px] h-[3px] bg-transparent rounded-full"
        style={{ boxShadow: largeStars, y: yLarge }}
      />

      {/* Nebulas/Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 dark:bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 dark:bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
    </div>
  );
}
