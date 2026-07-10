"use client";

import { MoonIcon, SunIcon } from "../landingSettings/icons/general";
import { useTheme } from "../landingSettings/context/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // If system theme, toggle to opposite of current system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme === "light" ? "dark" : "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="hover:shadow-input relative flex cursor-pointer items-center justify-center rounded-xl p-2 text-neutral-500 dark:text-neutral-500"
    >
      <SunIcon className="size-4 scale-100 rotate-0 text-gray-600 transition-all dark:scale-0 dark:-rotate-90 dark:text-gray-300" />
      <MoonIcon className="absolute size-4 scale-0 rotate-90 text-gray-600 transition-all dark:scale-100 dark:rotate-0 dark:text-gray-300" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
