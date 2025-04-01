"use client";

import React from "react";
import { UserFriendlyConfigForm } from "./UserFriendlyConfigForm";
import { ServiceCatalog } from "./ServiceCatalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IntegrationDashboard: React.FC = () => {  
  return (
    <div className="w-full bg-white dark:bg-black">
      <div className="container mx-auto py-2">
        <Tabs defaultValue="catalog" className="w-full">
          <div className="flex justify-end items-center mb-4">
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger 
                value="catalog" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:text-gray-400 dark:data-[state=active]:text-white"
              >
                Service Catalog
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:text-gray-400 dark:data-[state=active]:text-white"
              >
                Manual Configuration
              </TabsTrigger>
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