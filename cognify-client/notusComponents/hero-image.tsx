"use client";
import React, { useRef } from "react";
import { Container } from "./container";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Dot } from "./common/dots";

const springConfig = {
  stiffness: 300,
  damping: 30,
};

export const HeroImage = () => {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const translateX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-40, 40]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <Container className="border-divide perspective-distant relative flex flex-col items-center justify-center border-x bg-gray-105 p-6 md:p-10 lg:p-14 dark:bg-neutral-900">
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />
      
      <span className="text-brand text-[10px] font-bold uppercase tracking-widest mb-6 block select-none">
        Platform overview
      </span>

      <div className="relative w-full">
        <motion.div
          ref={ref}
          className="relative z-10 h-full w-full cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            opacity: {
              duration: 0.3,
              delay: 1,
            },
          }}
          style={{
            translateX,
            translateY,
          }}
        >
          <img
            src="/dashboard@3x.png"
            alt="Cognify Dashboard Preview"
            className="w-full rounded-lg shadow-2xl border border-neutral-300 dark:border-neutral-800"
            draggable={false}
          />
        </motion.div>
        <div className="border-(--pattern-fg) absolute inset-0 z-0 m-auto h-[90%] w-[95%] rounded-lg border bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-6 text-center select-none font-medium">
        The Cognify workspace — agents, memory, and analytics in one view.
      </p>
    </Container>
  );
};
