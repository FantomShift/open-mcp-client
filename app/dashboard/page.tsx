"use client";

import { useEffect, useState } from "react";
import { CopilotActionHandler } from "@/app/components/CopilotActionHandler";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { MessageSquare, Settings, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  }>({
    name: "Loading...",
    email: "loading@example.com",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      
      // Get user session
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      if (userData) {
        setUser({
          name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || "User",
          email: userData.email || "No email provided",
          avatar: userData.user_metadata?.avatar_url,
        });
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Client component that sets up the Copilot action handler */}
      <CopilotActionHandler />

      <DashboardHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Home", href: "/" }
        ]}
        user={user}
        notificationCount={0}
      />

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome, {user.name}!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access your UIP Admin tools and services below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chat Card */}
            <Link href="/chat" className="group">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium dark:text-white">Chat</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Interact with your AI assistant to get help with tasks and information.
                </p>
              </div>
            </Link>
            
            {/* Integrations Card */}
            <Link href="/integrations" className="group">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium dark:text-white">Integrations</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Configure and manage your MCP integrations with external services.
                </p>
              </div>
            </Link>
            
            {/* Settings Card */}
            <Link href="/settings" className="group">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                    <Settings className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium dark:text-white">Settings</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage your account settings and preferences.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 