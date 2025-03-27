"use client";

import React from "react";
import { UserFriendlyConfigForm } from "./UserFriendlyConfigForm";
import { ServiceCatalog } from "./ServiceCatalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

const IntegrationDashboard: React.FC = () => {  
  return (
    <div className="w-full">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="catalog" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Service Integrations</h1>
              <p className="text-muted-foreground">Connect your assistant to external services</p>
            </div>
            <TabsList>
              <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
              <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="catalog" className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800">Connection Process</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    After clicking &ldquo;Connect&rdquo; on a service, you&apos;ll need to authorize access by clicking the authorization link
                    that appears. This link will take you to the service&apos;s website to complete the connection.
                  </p>
                </div>
              </div>
            </div>
            <ServiceCatalog />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <UserFriendlyConfigForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { IntegrationDashboard }; 