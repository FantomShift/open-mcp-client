"use client";

import React, { useState } from "react";
import { 
  Bell, 
  ChevronRight, 
  Search, 
  User,
  Menu,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/app/components/providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface DashboardHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  isLoading?: boolean;
  notificationCount?: number;
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({
  title,
  breadcrumbs,
  user,
  isLoading = false,
  notificationCount = 0,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMobileMenuToggle}
          className="mr-2 rounded-md p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 md:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={`${item.href}-${index}`}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
                    index === breadcrumbs.length - 1 
                      ? "text-gray-900 dark:text-white font-medium pointer-events-none" 
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {item.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-[200px] rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-600"
          />
        </div>

        <ThemeToggle />

        <button 
          className="relative rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-2 rounded-full p-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="User menu"
            >
              {isLoading ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              ) : user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <span className="hidden md:inline-block">{isLoading ? "Loading..." : user.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{isLoading ? "Loading..." : user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{isLoading ? "Loading..." : user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 dark:text-red-400 cursor-pointer flex items-center"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 