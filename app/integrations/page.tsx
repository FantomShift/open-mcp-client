"use client";

import { DashboardHeader } from "@/app/components/DashboardHeader";
import { IntegrationDashboard } from "@/app/components/IntegrationDashboard";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function IntegrationsPage() {
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
        title="Service Integrations"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Integrations", href: "/integrations" }
        ]}
        user={user}
        notificationCount={0}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Connect your assistant to external services</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage connections between Adam and third-party services.
          </p>
          
          <IntegrationDashboard />
        </div>
      </main>
    </div>
  );
} 