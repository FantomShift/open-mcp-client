"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/components/providers";

export default function AnimationNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white dark:bg-gray-900 rounded-lg shadow-md p-1">
      <Link 
        href="/login" 
        className={`px-3 py-1 rounded ${
          pathname === '/login' 
            ? 'bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-white' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
        }`}
      >
        Beams
      </Link>
      <Link 
        href="/login/vortex" 
        className={`px-3 py-1 rounded ${
          pathname === '/login/vortex' 
            ? 'bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-white' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
        }`}
      >
        Vortex
      </Link>
      <button
        onClick={toggleTheme}
        className="w-8 h-8 flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
} 