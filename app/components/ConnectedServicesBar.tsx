"use client";

import React from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="flex items-center space-x-2">
          <AnimatePresence>
            {normalizedServices.length > 0 ? (
              <>
                {normalizedServices.map((service, index) => {
                  const serviceInfo = serviceIcons[service] || { 
                    icon: "", 
                    name: service.charAt(0).toUpperCase() + service.slice(1) 
                  };
                  
                  return (
                    <Tooltip key={service}>
                      <TooltipTrigger asChild>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8, y: 10 }} 
                          animate={{ opacity: 1, scale: 1, y: 0 }} 
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ 
                            scale: 1.1, 
                            boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                            transition: { duration: 0.2 }
                          }}
                          className="w-9 h-9 rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden border border-gray-200 dark:border-dark-DEFAULT cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          {serviceInfo.icon ? (
                            <img 
                              src={serviceInfo.icon} 
                              alt={serviceInfo.name}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-700 dark:text-true-white">{serviceInfo.name.substring(0, 2)}</span>
                          )}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-gray-800 dark:bg-true-black text-white border-none">
                        <p>{serviceInfo.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onManageIntegrations}
                        className="h-9 w-9 rounded-full bg-gray-100 dark:bg-black hover:bg-gray-200 dark:hover:bg-dark-hover ml-1"
                      >
                        <Plus className="h-4 w-4 text-gray-600 dark:text-true-white" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-800 dark:bg-true-black text-white border-none">
                    <p>Add more services</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <div className="flex items-center text-sm text-gray-500 dark:text-dark-muted mr-2">
                  <AlertCircle className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-400 animate-pulse-subtle" />
                  <span>No services connected</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onManageIntegrations}
                        className={`text-xs text-blue-600 dark:text-white hover:underline`}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Service
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-800 dark:bg-true-black text-white border-none">
                    <p>Connect integrations for your assistant</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </div>
  );
} 