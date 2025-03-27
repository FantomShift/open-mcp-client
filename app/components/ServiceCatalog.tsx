"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { MCPServiceIntegrationCard } from "@/components/MCPServiceIntegrationCard";
import { useToast } from "@/components/ui/toaster";
import { useSearchParams } from "next/navigation";
import { Loader2, ExternalLink } from "lucide-react";

// Types for MCP services
type MCPService = {
  id: string;
  name: string;
  description: string;
  category: string;
  iconUrl?: string;
  isPopular?: boolean;
};

export function ServiceCatalog() {
  const [services, setServices] = useState<MCPService[]>([]);
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const [serviceUrls, setServiceUrls] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Popular");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionInProgress, setConnectionInProgress] = useState<string | null>(null);
  const [authLinks, setAuthLinks] = useState<Record<string, string>>({});
  const [useAgentMode, setUseAgentMode] = useState(false); // Default to direct redirect
  const { addToast } = useToast();

  // Get all available categories
  const categories = ["Popular", ...Array.from(new Set(services.map(s => s.category)))];
  
  // Filter services by selected category
  const filteredServices = selectedCategory === "Popular"
    ? services.filter(s => s.isPopular)
    : services.filter(s => s.category === selectedCategory);

  // Fetch user connections from Supabase
  const fetchUserConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      // Get user session
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      if (userData) {
        setUser(userData);
        
        // Fetch user's connected services
        const { data: connections, error } = await supabase
          .from('user_connections')
          .select('*')
          .eq('user_id', userData.id)
          .single();
        
        if (connections) {
          // Track connected services and their URLs
          const connectedIds: string[] = [];
          const urls: Record<string, string> = {};
          
          // Handle both the new array field and the old config object
          if (connections.connected_services && Array.isArray(connections.connected_services)) {
            // Normalize service IDs from connected_services array
            connections.connected_services.forEach(serviceId => {
              const normalizedId = normalizeServiceId(serviceId);
              if (!connectedIds.includes(normalizedId)) {
                connectedIds.push(normalizedId);
              }
            });
          }
          
          // Get URLs from config
          if (connections.config && typeof connections.config === 'object') {
            // Add any services from config that aren't already in connected_services
            Object.keys(connections.config).forEach(serviceId => {
              // Normalize service ID for matching with UI
              const normalizedId = normalizeServiceId(serviceId);
              
              if (!connectedIds.includes(normalizedId)) {
                connectedIds.push(normalizedId);
              }
              
              // Store the URL for this service
              if (connections.config[serviceId]?.url) {
                urls[normalizedId] = connections.config[serviceId].url;
              }
            });
          }
          
          console.log('Connected services normalized:', connectedIds);
          
          // Update state with connected services and their URLs
          setConnectedServices(connectedIds);
          setServiceUrls(urls);
        }
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user connections:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching user and connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to normalize service IDs
  const normalizeServiceId = (serviceId: string): string => {
    // Convert to lowercase
    let normalized = serviceId.toLowerCase();
    
    // Remove spaces
    normalized = normalized.replace(/\s+/g, '');
    
    // Special case for "google sheets" -> "googlesheets"
    if (normalized === 'googlesheets' || normalized === 'googlesheet') {
      return 'googlesheets';
    }
    
    // Special case for "googledocs" -> "googlesheets" (if needed)
    if (normalized === 'googledocs') {
      return 'googlesheets';
    }
    
    return normalized;
  };

  // Check URL parameters for connection status
  useEffect(() => {
    // Check query parameters for connection status
    const searchParams = new URLSearchParams(window.location.search);
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    
    // If there was a successful connection
    if (successParam) {
      if (successParam.startsWith('connected_')) {
        const serviceName = successParam.replace('connected_', '');
        addToast({
          title: "Connection Successful",
          description: `Successfully connected to ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}`,
          variant: "success",
        });
        
        // Refresh connected services data
        fetchUserConnections();
      } else if (successParam.startsWith('authorized_')) {
        const serviceName = successParam.replace('authorized_', '');
        addToast({
          title: "Authorization Successful",
          description: `Successfully authorized ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}`,
          variant: "success",
        });
        
        // Refresh connected services data
        fetchUserConnections();
      }
      
      // Clear URL parameters by using replaceState
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // If there was an error with connection
    if (errorParam) {
      let errorTitle = "Connection Failed";
      let errorMessage = "There was a problem connecting to the service.";
      
      switch (errorParam) {
        case 'invalid_state':
          errorMessage = "Invalid state parameter or connection request expired.";
          break;
        case 'connection_failed':
          errorMessage = "Failed to update connection status.";
          break;
        case 'server_error':
          errorTitle = "Server Error";
          errorMessage = "An unexpected server error occurred.";
          break;
      }
      
      addToast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clear URL parameters by using replaceState
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast, fetchUserConnections]);

  // Fetch user data and connected services
  useEffect(() => {
    fetchUserConnections();
  }, [fetchUserConnections]);

  // Fetch services from Composio
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/mcp-services');
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        addToast({
          title: "Failed to load services",
          description: "We couldn't load the available services. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchServices();
  }, [addToast]);

  // Connect to a service
  const connectToService = async (serviceId: string, agentMode = false) => {
    if (!user) {
      addToast({
        title: "Authentication Required",
        description: "Please sign in to connect services.",
        variant: "destructive",
      });
      return;
    }
    
    setConnectionInProgress(serviceId);
    try {
      console.log(`Initiating connection to ${serviceId}`);
      
      // Initiate a connection - this now immediately adds the service to user_connections
      const response = await fetch('/api/mcp-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Error response from mcp-connect:`, data);
        throw new Error(data.error || `Failed to initiate connection to ${serviceId}`);
      }
      
      console.log(`Got service URL for ${serviceId}:`, data.redirectUrl);
      
      // Immediately update the list of connected services since it's now connected in the database
      // This will make the UI show the service as "Connected" right away
      const updatedConnectedServices = [...connectedServices, serviceId];
      setConnectedServices(updatedConnectedServices);
      
      // Update service URL if applicable
      if (data.redirectUrl) {
        setServiceUrls(prev => ({
          ...prev,
          [serviceId]: data.redirectUrl
        }));
      }
      
      // Show success message
      addToast({
        title: "Service Connected",
        description: `Successfully connected to ${serviceId}. You can now use this service.`,
        variant: "success",
        duration: 5000,
      });
      
      // Handle the optional authorization URL based on the chosen mode
      if (data.redirectUrl) {
        if (agentMode) {
          // In agent mode, display the auth link for the user to click
          setAuthLinks(prev => ({
            ...prev,
            [serviceId]: data.redirectUrl
          }));
          
          addToast({
            title: "Optional: Authorize Access",
            description: `You can visit the service URL to authorize access to ${serviceId}.`,
            variant: "info",
            duration: 10000,
          });
        } else {
          // In direct mode, offer to open the service URL in a new tab
          if (confirm(`Would you like to open ${serviceId} in a new tab to authorize access?`)) {
            window.open(data.redirectUrl, '_blank');
          }
        }
      }
      
    } catch (error) {
      console.error("Error connecting to service:", error);
      addToast({
        title: "Connection Failed",
        description: error instanceof Error 
          ? `Error: ${error.message}` 
          : `Failed to connect to ${serviceId}. Please try again.`,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      // We're done with the connection process
      setConnectionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Auth mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Service Catalog</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Connection mode:</span>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${!useAgentMode ? "font-medium text-blue-600" : "text-gray-500"}`}>Direct</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useAgentMode}
                onChange={() => setUseAgentMode(!useAgentMode)}
                aria-label="Toggle agent mode"
                title="Toggle between direct and agent-style connection modes"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className={`text-xs ${useAgentMode ? "font-medium text-blue-600" : "text-gray-500"}`}>Agent-style</span>
          </div>
          <button 
            className="text-blue-500 hover:text-blue-700 text-xs flex items-center"
            onClick={() => {
              addToast({
                title: "Connection Modes",
                description: "Direct mode redirects you immediately. Agent-style mode shows an authorization link like an AI agent would in chat.",
                variant: "info",
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Help
          </button>
        </div>
      </div>
      
      {/* Category tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => {
          // Normalize the service ID for comparison with our connected services list
          const normalizedServiceId = normalizeServiceId(service.id);
          const isConnected = connectedServices.includes(normalizedServiceId);
          const isConnecting = connectionInProgress === service.id;
          const authLink = authLinks[service.id];
          const serverUrl = serviceUrls[normalizedServiceId];
          
          console.log(`Service: ${service.name}, ID: ${service.id}, Normalized: ${normalizedServiceId}, Connected: ${isConnected}`);
          
          return (
            <MCPServiceIntegrationCard
              key={service.id}
              serviceName={service.name}
              description={service.description}
              logoSrc={service.iconUrl}
              authLink={authLink}
              serverUrl={serverUrl}
              status={
                isConnected 
                  ? "connected" 
                  : isConnecting 
                  ? "connecting"
                  : "disconnected"
              }
              onConnect={() => {
                if (!isConnected) {
                  // If we're showing an auth link already, don't do anything
                  // This prevents multiple clicks while the auth link is showing
                  if (authLink) return;
                  
                  // Use the user's preference for connection mode
                  connectToService(service.id, useAgentMode);
                }
              }}
            />
          );
        })}
      </div>
      
      {filteredServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No services found in this category.
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500 pt-4">
        <a
          href="https://mcp.composio.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-blue-600 inline-flex items-center"
        >
          View all services on mcp.composio.dev
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
} 