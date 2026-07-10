import React from "react";
import { cn } from "../../landingSettings/lib/utils";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("p-4 md:p-8", className)}>{children}</div>;
};

export const CardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn("text-lg font-medium", className)}
      style={{
        color: "var(--primary)",
      }}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn("mt-2 text-base", className)}
      style={{
        color: "var(--color-gray-600)",
      }}
    >
      {children}
    </p>
  );
};
