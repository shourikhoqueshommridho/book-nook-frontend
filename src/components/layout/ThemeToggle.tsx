"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_STORAGE_KEY = "booknook-theme";

type Theme = "light" | "dark";

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void) {
  // Re-read the theme whenever the `dark` class changes on <html>
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * Light/dark toggle. The theme is initialized by an inline script in the
 * root layout to avoid a flash; this component reads the `dark` class
 * as an external store so the icon always matches the real state.
 */
export function ThemeToggle() {
  const theme = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — theme just won't persist
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
