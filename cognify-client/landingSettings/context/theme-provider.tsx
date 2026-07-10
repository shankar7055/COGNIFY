"use client";

import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
}

const ThemeContext = React.createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState("dark");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div {...props}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
