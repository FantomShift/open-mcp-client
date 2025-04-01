"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setExpanded(!expanded);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/",
      active: pathname === "/"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Chat",
      href: "/chat",
      active: pathname === "/chat"
    },
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Integrations",
      href: "/integrations",
      active: pathname === "/integrations"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/settings",
      active: pathname === "/settings"
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden"
        aria-label="Toggle mobile menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Desktop sidebar */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-all md:block",
          expanded ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
        initial={false}
      >
        {/* Mobile close button */}
        <button
          onClick={toggleMobile}
          className="absolute top-4 right-4 p-1 md:hidden text-gray-500 dark:text-gray-400"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 bg-gray-800 dark:bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold">UI</span>
            </div>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 font-semibold text-gray-800 dark:text-gray-100"
              >
                UIP Admin
              </motion.span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hidden md:block"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    item.active
                      ? "bg-gray-100 dark:bg-black text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/60 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                v1.0.0
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar; 