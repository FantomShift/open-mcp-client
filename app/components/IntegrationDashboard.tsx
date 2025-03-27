"use client";

import React from "react";
import { UserFriendlyConfigForm } from "./UserFriendlyConfigForm";
import { ServiceCatalog } from "./ServiceCatalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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