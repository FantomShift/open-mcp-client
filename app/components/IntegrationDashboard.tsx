"use client";

import React from "react";
import { UserFriendlyConfigForm } from "./UserFriendlyConfigForm";
import { ServiceCatalog } from "./ServiceCatalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IntegrationDashboard: React.FC = () => {  
  return (
    <div className="w-full">
      <div className="container mx-auto py-2">
        <Tabs defaultValue="catalog" className="w-full">
          <div className="flex justify-end items-center mb-4">
            <TabsList>
              <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
              <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="catalog" className="mt-0">
            <ServiceCatalog />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-0">
            <UserFriendlyConfigForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { IntegrationDashboard }; 