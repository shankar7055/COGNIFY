"use client";

import { useState } from "react";
import { Container } from "./container";
import { cn } from "../landingSettings/lib/utils";
import { logos } from "../landingSettings/constants/logos";

export const LogoCloud = () => {
  const [displayedIndices] = useState<number[]>(() =>
    Array.from({ length: 6 }, (_, i) => i),
  );

  return (
    <Container className="border-divide border-x">
      <h2 className="py-8 text-center font-mono text-sm uppercase tracking-tight text-neutral-500 dark:text-gray-300">
        Trusted by engineering teams at
      </h2>
      <div className="border-divide grid grid-cols-2 border-t sm:grid-cols-3 md:grid-cols-6">
        {displayedIndices.map((logoIndex, position) => {
          const logo = logos[logoIndex];

          return (
            <div
              key={position}
              className={cn(
                "border-divide group relative overflow-hidden",
                // Mobile layout (grid-cols-2): odd positions have right border, all except last 2 have bottom border
                position % 2 === 0 ? "border-r" : "",
                position < 4 ? "border-b" : "",
                // Tablet layout (sm:grid-cols-3): columns 0 and 1 have right border, first 3 have bottom border
                "sm:border-r-0 sm:border-b-0",
                position % 3 !== 2 ? "sm:border-r" : "",
                position < 3 ? "sm:border-b" : "",
                // Desktop layout (md:grid-cols-6): no bottom borders, all except column 5 have right border
                "md:border-b-0 md:border-r-0",
                position % 6 !== 5 ? "md:border-r" : "md:border-r-0",
              )}
            >
              <div className="bg-brand/5 absolute inset-x-0 bottom-0 h-full translate-y-full transition-all duration-200 group-hover:translate-y-0"></div>
              <div className="group flex min-h-24 items-center justify-center p-4 py-8 select-none">
                <span className="font-sans font-bold text-lg tracking-tight text-neutral-400 group-hover:text-brand transition-colors duration-200">
                  {logo.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};
