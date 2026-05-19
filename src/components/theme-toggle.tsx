"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "classwall:theme";

type Theme = "light" | "dark";

function readInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // hydration 後才讀取真實主題，避免 SSR mismatch
  // （effect 內 setState 是 client-only state 同步的標準作法）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readInitial());
    setMounted(true);
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";

    // 從點擊位置擴散切換（Dazzling 視覺）
    const root = document.documentElement;
    root.style.setProperty("--theme-x", `${event.clientX}px`);
    root.style.setProperty("--theme-y", `${event.clientY}px`);

    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      window.localStorage.setItem(STORAGE_KEY, next);
      setTheme(next);
    };

    // 支援 View Transitions API 的瀏覽器走儀式感切換
    const vt = (
      document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition;

    if (typeof vt === "function") {
      vt.call(document, apply);
    } else {
      apply();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "切換亮色主題" : "切換暗色主題"}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-border/70 bg-card/60 backdrop-blur-md",
        "transition-all hover:scale-105 hover:border-primary/60 hover:bg-card/80",
        "shadow-[0_1px_0_oklch(0.92_0.02_70)] dark:shadow-none"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? theme : "initial"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex"
        >
          {theme === "dark" ? (
            <Moon size={18} strokeWidth={1.8} />
          ) : (
            <Sun size={18} strokeWidth={1.8} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
