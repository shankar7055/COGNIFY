"use client";
import { Container } from "./container";
import { Heading } from "./heading";
import { SubHeading } from "./subheading";
import { Star } from "../landingSettings/icons/general";
import { motion } from "motion/react";
import { Button } from "./button";
import { Badge } from "./badge";
// import { Link } from "react-router-dom"; // Removed for portability

export const Hero = () => {
  return (
    <Container className="border-divide flex flex-col items-center justify-center border-x px-4 pt-10 pb-10 md:pt-32 md:pb-20">
      <Badge text="For fast-moving engineering teams." />
      <Heading className="mt-4">
        Orchestrate and automate <br /> agentic{" "}
        <span className="text-brand">workflows</span>
      </Heading>

      <SubHeading className="mx-auto mt-6 max-w-lg">
        Cognify lets developers build, test, and deploy specialized AI agents —
        with RAG memory, multi-agent routing, workflow automation,
        and real-time analytics in one platform.
      </SubHeading>

      <div className="mt-6 flex items-center gap-4">
        <Button as="a" href="/sign-up">
          Start building
        </Button>
        <Button variant="secondary" as="a" href="/pricing">
          View pricing
        </Button>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className="bg-[#FF4F00] text-white text-[11px] font-black px-1.5 py-0.5 rounded tracking-tight select-none">G2</span>
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <Star key={index} />
          ))}
        </div>
        <span className="border-l border-gray-300 pl-3 text-xs text-gray-600 dark:text-gray-400">
          Innovative AI solution 2025 by Gartner
        </span>
      </div>
    </Container>
  );
};
