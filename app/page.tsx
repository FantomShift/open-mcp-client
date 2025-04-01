"use client";

import React, { useState, useEffect } from "react";
import { CopilotActionHandler } from "./components/CopilotActionHandler";
import { createClient } from "@/utils/supabase/client";
import { 
  LayoutDashboard, 
  UserCog, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  ChevronDown, 
  User,
  Menu,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  PanelRightOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle, useTheme } from "./components/providers";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

// UI Components
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IntegrationDashboard } from "./components/IntegrationDashboard";
import { Button } from "@/components/ui/button";
import { ConnectedServicesBar } from "./components/ConnectedServicesBar";

export default function Home() {
  const router = useRouter();
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  }>({
    name: "Loading...",
    email: "loading@example.com",
  });

  // Toggle between chat and integrations in the main panel
  const toggleMainPanel = () => {
    setIsIntegrationsOpen(!isIntegrationsOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsUserLoading(true);
      try {
        const supabase = createClient();
        
        // Get user session
        const { data: { user: userData } } = await supabase.auth.getUser();
        
        if (userData) {
          setUser({
            name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || "User",
            email: userData.email || "No email provided",
            avatar: userData.user_metadata?.avatar_url,
          });
          
          // Fetch user's connected services
          const { data: userConnections } = await supabase
            .from('user_connections')
            .select('*')
            .eq('user_id', userData.id)
            .single();
            
          if (userConnections && userConnections.connected_services) {
            setConnectedServices(userConnections.connected_services);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsUserLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navLinks = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: true
    },
    {
      label: "UIP:[TBA]",
      href: "#",
      icon: <Settings className="h-5 w-5" />,
      active: false
    }
  ];

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gray-50 dark:bg-black flex">
      {/* CopilotKit action handler */}
      <CopilotActionHandler />
      
      {/* Sidebar - Desktop */}
      <motion.div
        className={cn(
          "fixed inset-y-0 left-0 z-30 bg-white dark:bg-black border-r border-gray-200 dark:border-dark-DEFAULT transition-all duration-300 hidden md:flex md:flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
        initial={false}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-DEFAULT">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 dark:bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold">UI</span>
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 font-semibold text-gray-900 dark:text-white"
              >
                UIP Admin
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-dark-muted" /> : <ChevronRight className="h-5 w-5 text-gray-500 dark:text-dark-muted" />}
          </button>
        </div>
        
        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  link.active
                    ? "bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-white"
                    : "text-gray-700 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-hover"
                )}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 font-medium"
                  >
                    {link.label}
                  </motion.span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Logout button */}
        <div className="border-t border-gray-200 dark:border-dark-DEFAULT p-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center px-3 py-2 w-full rounded-md transition-colors text-gray-700 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-hover"
            )}
          >
            <LogOut className="flex-shrink-0 h-5 w-5" />
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 font-medium"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.div>
      
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Mobile sidebar */}
      <motion.div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-dark-DEFAULT md:hidden transform transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        initial={false}
      >
        {/* Mobile sidebar content */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-DEFAULT">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 dark:bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold">UI</span>
            </div>
            <span className="ml-3 font-semibold text-gray-900 dark:text-white">UIP Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover"
            aria-label="Close mobile menu"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-dark-muted" />
          </button>
        </div>
        
        {/* Mobile navigation links */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  link.active
                    ? "bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-white"
                    : "text-gray-700 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-hover"
                )}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span className="ml-3 font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile logout button */}
        <div className="border-t border-gray-200 dark:border-dark-DEFAULT p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md transition-colors text-gray-700 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-hover"
          >
            <LogOut className="flex-shrink-0 h-5 w-5" />
            <span className="ml-3 font-medium">Logout</span>
          </button>
        </div>
      </motion.div>
      
      {/* Main layout - full width single panel that toggles between integrations and chat */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 overflow-hidden",
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        {/* Header */}
        <header className="z-30 h-14 bg-white dark:bg-black border-b border-gray-200 dark:border-dark-DEFAULT flex items-center justify-between px-4 md:px-6 sticky top-0">
          {/* Left section with mobile menu toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover md:hidden mr-2"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5 text-gray-500 dark:text-dark-muted" />
            </button>
            
            {/* Add Chat button at the beginning of connected services */}
            <Button
              variant={isIntegrationsOpen ? "default" : "outline"}
              onClick={toggleMainPanel}
              size="sm"
              className={`mr-3 gap-2 hidden md:flex ${
                isIntegrationsOpen 
                  ? "bg-primary dark:bg-gray-300 dark:text-black" 
                  : "dark:border-gray-500 dark:text-white hover:dark:bg-gray-800"
              }`}
            >
              {isIntegrationsOpen ? (
                <>
                  <MessageSquare className="h-4 w-4" /> 
                  <span>Open Chat</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="h-4 w-4" /> 
                  <span>Show Integrations</span>
                </>
              )}
            </Button>
            
            {/* Show connected integrations as icons */}
            <ConnectedServicesBar 
              connectedServices={connectedServices}
              onManageIntegrations={() => {
                if (!isIntegrationsOpen) toggleMainPanel();
              }}
            />
          </div>
          
          {/* Right section with search, notifications, profile, and theme toggle */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-dark-muted" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-9 pr-4 py-2 rounded-full border-gray-300 dark:border-dark-DEFAULT dark:bg-black dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Notifications */}
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover relative"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-dark-muted" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover"
                  aria-label="User menu"
                >
                  {isUserLoading ? (
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-dark-accent animate-pulse"></div>
                  ) : user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-gray-800 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600 dark:text-white" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-white">
                      {isUserLoading ? "Loading..." : user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      {isUserLoading ? "..." : user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-dark-muted hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-black dark:border-dark-DEFAULT">
                <DropdownMenuLabel className="dark:text-white">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-dark-DEFAULT" />
                <DropdownMenuItem className="dark:text-dark-muted dark:focus:bg-dark-hover dark:focus:text-white">
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:text-dark-muted dark:focus:bg-dark-hover dark:focus:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-dark-DEFAULT" />
                <DropdownMenuItem onClick={handleLogout} className="dark:text-dark-muted dark:focus:bg-dark-hover dark:focus:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main content - single panel that toggles between integrations and chat */}
        <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          {/* Integrations panel */}
          <div 
            className={cn(
              "h-full transition-all duration-300 overflow-auto",
              isIntegrationsOpen ? "block" : "hidden"
            )}
          >
            {/* Connected services summary and integrations content */}
            <div className="bg-white dark:bg-black p-4 md:p-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Service Integrations</h1>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Connect your assistant to external services</p>
              </div>
            </div>
            
            <IntegrationDashboard />
          </div>
          
          {/* Enhanced Chat panel with animations */}
          <div 
            className={cn(
              "h-full bg-white dark:bg-black transition-all duration-300 flex flex-col",
              !isIntegrationsOpen ? "flex" : "hidden"
            )}
          >
            <div className="bg-white dark:bg-black p-4 md:p-6 flex items-center justify-between border-b border-gray-200 dark:border-dark-DEFAULT flex-shrink-0">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Integrations Chat</h1>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Use your tools to get the job done</p>
              </div>
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block"
              >
                <div className="px-3 py-1.5 bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-white text-xs rounded-full">
                  <span className="animate-pulse-subtle mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-600 dark:bg-white"></span>
                  Ready to assist you
                </div>
              </motion.div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <VercelV0Chat />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMainPanel}
        className="fixed bottom-4 right-4 z-30 p-3 bg-blue-600 dark:bg-black text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-gray-900 md:hidden"
        aria-label={isIntegrationsOpen ? "Open chat" : "Show integrations"}
      >
        {isIntegrationsOpen ? (
          <MessageSquare className="h-6 w-6" />
        ) : (
          <PanelRightOpen className="h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
}
