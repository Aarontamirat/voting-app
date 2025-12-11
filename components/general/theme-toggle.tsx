"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, hover } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle Theme"
      className="relative w-7 h-7 md:w-10 md:h-10 flex items-center justify-center rounded-full dark:bg-transparent bg-gray-800 border dark:border-amber-300/40 dark:hover:border-amber-300/70 border-gray-700 hover:border-gray-500 shadow-sm hover:shadow-md shadow-gray-600 dark:shadow-amber-300/70 transition-all duration-300"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
            whileHover={{ rotate: -45, opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <Sun
              className="md:w-7 md:h-7 p-1 text-yellow-500"
              fill="currentColor"
            />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
            whileHover={{ rotate: 30, opacity: 1, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Moon
              className="md:w-7 md:h-7 p-1 text-neutral-500 hover:text-neutral-300 transition-all"
              fill="currentColor"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
