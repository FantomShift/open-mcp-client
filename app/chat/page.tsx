"use client";

import { DashboardHeader } from "@/app/components/DashboardHeader";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ChatPage() {
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
      <DashboardHeader
        title="Chat"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Chat", href: "/chat" }
        ]}
        user={user}
        notificationCount={0}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Chat Interface</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Chat functionality will be implemented here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 