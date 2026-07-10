import { cn } from "../landingSettings/lib/utils";
import React from "react";

export const Container = <T extends React.ElementType = "div">({
  children,
  className,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  as?: T;
}) => {
  const Component = as || "div";
  return (
    <Component className={cn("mx-auto max-w-7xl", className)}>
      {children}
    </Component>
  );
};
