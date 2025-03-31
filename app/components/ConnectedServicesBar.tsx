"use client";

import React from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Service icon mapping
const serviceIcons: Record<string, { icon: string, name: string }> = {
  gmail: { 
    icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_32dp.png", 
    name: "Gmail" 
  },
  googledrive: { 
    icon: "https://www.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png", 
    name: "Google Drive" 
  },
  googlesheets: { 
    icon: "https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_32dp.png", 
    name: "Google Sheets" 
  },
  github: { 
    icon: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png", 
    name: "GitHub" 
  },
  googlemeet: { 
    icon: "https://www.gstatic.com/images/branding/product/1x/meet_2020q4_32dp.png", 
    name: "Google Meet" 
  },
  slack: { 
    icon: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_128.png", 
    name: "Slack" 
  },
  notion: { 
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png", 
    name: "Notion" 
  }
};

interface ConnectedServicesBarProps {
  connectedServices: string[];
  onManageIntegrations: () => void;
}

export function ConnectedServicesBar({ connectedServices, onManageIntegrations }: ConnectedServicesBarProps) {
  // Filter out empty services and normalize names
  const normalizedServices = connectedServices
    .filter(service => service && service.trim() !== '')
    .map(service => service.toLowerCase());
    
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <div className="flex items-center space-x-1">
          {normalizedServices.length > 0 ? (
            <>
              {normalizedServices.map((service) => {
                const serviceInfo = serviceIcons[service] || { 
                  icon: "", 
                  name: service.charAt(0).toUpperCase() + service.slice(1) 
                };
                
                return (
                  <Tooltip key={service}>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors hover:bg-blue-50">
                        {serviceInfo.icon ? (
                          <img 
                            src={serviceInfo.icon} 
                            alt={serviceInfo.name}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold">{serviceInfo.name.substring(0, 2)}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{serviceInfo.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onManageIntegrations}
                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 ml-1"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Manage integrations</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="flex items-center text-sm text-gray-500 mr-2">
                <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                <span>No services connected</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onManageIntegrations}
                    className="text-xs h-7 px-2 border-dashed border-gray-300"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Service
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Connect integrations for your assistant</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
} 