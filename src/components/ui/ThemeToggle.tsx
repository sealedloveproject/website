"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { Button } from "./Button";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "full";
}

export function ThemeToggle({ className = "", variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder with the same dimensions while mounting
  if (!mounted) {
    return (
      <div className={`${className}`}>
        {variant === "icon" ? (
          <div className="w-9 h-9 flex items-center justify-center rounded-md bg-foreground/10 border border-foreground/20 shadow-sm">
            <div className="w-5 h-5"></div>
          </div>
        ) : (
          <div className="h-9 w-32 rounded-lg bg-foreground/10"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {variant === "icon" ? (
        <Button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          variant="ghost"
          size="icon"
          className="relative overflow-hidden"
          aria-label="Toggle theme"
        >
          <div className="relative w-5 h-5">
            {/* Sun icon - shown in dark mode, needs to be white/bright */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              className={`absolute inset-0 w-5 h-5 transition-opacity duration-300 ${
                theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "opacity-100" : "opacity-0"
              }`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            
            {/* Moon icon - shown in light mode, needs to be dark */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333333"
              className={`absolute inset-0 w-5 h-5 transition-opacity duration-300 ${
                theme === "light" || (theme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches) ? "opacity-100" : "opacity-0"
              }`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            
            {/* Highlight effect */}
            <span className="absolute inset-0 bg-primary/10 rounded-full scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-all duration-300"></span>
          </div>
        </Button>
      ) : (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
          <Button
            onClick={() => setTheme("light")}
            variant="ghost"
            size="icon"
            className={`p-1.5 rounded-md transition-colors ${
              theme === "light" ? "bg-foreground/10 text-primary" : "text-foreground/70"
            }`}
            aria-label="Light mode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </Button>
          <Button
            onClick={() => setTheme("dark")}
            variant="ghost"
            size="icon"
            className={`p-1.5 rounded-md transition-colors ${
              theme === "dark" ? "bg-foreground/10 text-primary" : "text-foreground/70"
            }`}
            aria-label="Dark mode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </Button>
          <Button
            onClick={() => setTheme("system")}
            variant="ghost"
            size="icon"
            className={`p-1.5 rounded-md transition-colors ${
              theme === "system" ? "bg-foreground/10 text-primary" : "text-foreground/70"
            }`}
            aria-label="System theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
