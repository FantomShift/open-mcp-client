"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { MCPServiceIntegrationCard } from "@/components/MCPServiceIntegrationCard";
import { useToast } from "@/components/ui/toaster";

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
  const [user, setUser] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionInProgress, setConnectionInProgress] = useState<string | null>(null);
  const [authLinks, setAuthLinks] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  // Define a function to dispatch custom events for connection changes
  const notifyConnectionChanged = () => {
    console.log("Dispatching service-connection-changed event");
    const event = new Event('service-connection-changed');
    window.dispatchEvent(event);
  };

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
      
      // Clear all state before fetching new data to avoid stale connections
      setConnectedServices([]);
      setServiceUrls({});
      setAuthLinks({});
      
      const supabase = createClient();
      
      // Get user session
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      if (userData) {
        setUser({...userData});
        
        // Fetch user's connected services
        const { data: userConnections, error } = await supabase
          .from('user_connections')
          .select('*')
          .eq('user_id', userData.id)
          .single();
        
        if (userConnections) {
          // Track connected services and their URLs
          const connectedIds: string[] = [];
          const urls: Record<string, string> = {};
          
          console.log('Raw database data:', JSON.stringify(userConnections, null, 2));
          
          // IMPORTANT: We're seeing issues with services showing as connected when they shouldn't.
          // Let's ONLY consider services that are in the config object AND have a valid URL
          if (userConnections.config && typeof userConnections.config === 'object') {
            console.log('Found config object with services:', Object.keys(userConnections.config));
            
            // Process each service in the config
            for (const configKey of Object.keys(userConnections.config)) {
              // Skip empty config entries or ones without URLs
              if (!userConnections.config[configKey] || !userConnections.config[configKey].url) {
                console.log(`Skipping config entry ${configKey} - no valid URL`);
                continue;
              }
              
              const normalizedKey = normalizeServiceId(configKey);
              if (!normalizedKey) continue;
              
              // Valid service found in config with URL - consider it connected
              console.log(`Found valid service in config: ${configKey} (normalized: ${normalizedKey})`);
              
              // Add service to connected list
              connectedIds.push(normalizedKey);
              urls[normalizedKey] = userConnections.config[configKey].url;
            }
          }
          
          console.log('Final connected services:', connectedIds);
          
          // Update state with connected services and their URLs
          setConnectedServices(connectedIds);
          setServiceUrls(urls);
          
          // Now fetch fresh authorization links for all connected services
          if (connectedIds.length > 0) {
            console.log('Fetching authorization links for connected services:', connectedIds);
            
            // Create a new object to store the auth links
            const newAuthLinks: Record<string, string> = {};
            
            // Fetch auth links for each connected service
            for (const serviceId of connectedIds) {
              try {
                // Call the API to get a fresh authorization URL for this service
                const response = await fetch('/api/mcp-connect', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ serviceId }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  if (data.authorizationUrl) {
                    console.log(`Got auth URL for ${serviceId}:`, data.authorizationUrl);
                    newAuthLinks[serviceId] = data.authorizationUrl;
                  }
                }
                
                // Add a small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
              } catch (error) {
                console.error(`Error fetching auth link for ${serviceId}:`, error);
              }
            }
            
            // Update auth links state with all the fresh links
            setAuthLinks(newAuthLinks);
          }
        } else {
          console.log('No connections found in database');
        }
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user connections:', error);
        }
      } else {
        console.log('No user logged in');
      }
    } catch (error) {
      console.error('Error fetching user and connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to normalize service IDs
  const normalizeServiceId = (serviceId: string): string => {
    // Handle null or undefined
    if (!serviceId) return '';
    
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
    
    // Special case for "google drive" -> "googledrive"
    if (normalized === 'googledrive') {
      return 'googledrive';
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
    // Immediately fetch connections on mount
    fetchUserConnections();
    
    // No periodic refresh - we have a manual refresh button instead
    // This prevents unwanted page flashing
    
  }, [fetchUserConnections]);

  // Fetch services from Composio
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/mcp-services');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Special handling for authentication errors
          if (response.status === 401) {
            console.error('Authentication required to fetch services');
            addToast({
              title: "Authentication Required",
              description: "Please sign in to view available services.",
              variant: "warning",
            });
            return;
          }
          
          throw new Error(errorData.error || 'Failed to fetch services');
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
  const connectToService = async (serviceId: string) => {
    if (!user) {
      addToast({
        title: "Authentication Required",
        description: "Please sign in to connect services.",
        variant: "destructive",
      });
      return;
    }
    
    const normalizedServiceId = normalizeServiceId(serviceId);
    console.log(`Connecting to service: ${serviceId} (normalized: ${normalizedServiceId})`);
    
    setConnectionInProgress(serviceId);
    try {
      console.log(`Initiating connection to ${serviceId}`);
      
      // Initiate a connection - this now immediately adds the service to user_connections
      const response = await fetch('/api/mcp-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId: normalizedServiceId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Error response from mcp-connect:`, data);
        throw new Error(data.error || `Failed to initiate connection to ${serviceId}`);
      }
      
      console.log(`Got service URL for ${normalizedServiceId}:`, data.redirectUrl);
      
      // Format authorization URL properly for Composio
      let authorizationUrl = data.authorizationUrl || data.redirectUrl;
      // Make sure the URL has protocol
      if (authorizationUrl && !authorizationUrl.startsWith('http')) {
        authorizationUrl = `https://${authorizationUrl}`;
      }
      
      console.log(`Got auth URL for ${normalizedServiceId}:`, authorizationUrl);
      
      // Immediately update the list of connected services since it's now connected in the database
      // This will make the UI show the service as "Connected" right away
      const updatedConnectedServices = [...connectedServices, normalizedServiceId];
      console.log('Updating connected services to:', updatedConnectedServices);
      setConnectedServices(updatedConnectedServices);
      
      // Notify other components that connections have changed
      notifyConnectionChanged();
      
      // Update service URL (MCP server URL) if applicable 
      if (data.redirectUrl) {
        setServiceUrls(prev => ({
          ...prev,
          [normalizedServiceId]: data.redirectUrl
        }));
      }
      
      // Show success message with improved description that includes authorization info
      addToast({
        title: "Service Connected",
        description: `Successfully connected to ${serviceId}. ${authorizationUrl ? "Click the 'Authorize via Composio' button to complete setup." : ""}`,
        variant: "success",
        duration: 8000,
      });
      
      // Handle the authorization URL from Composio for OAuth
      if (authorizationUrl) {
        // Always display the auth link for the user to click
        console.log(`Setting auth link for ${normalizedServiceId}:`, authorizationUrl);
        
        setAuthLinks(prev => {
          const newLinks = {
            ...prev,
            [normalizedServiceId]: authorizationUrl
          };
          console.log("Updated auth links:", newLinks);
          return newLinks;
        });
      }
      else {
        // No authorization URL was provided - inform the user to use the chat
        addToast({
          title: "Authorization Required",
          description: `To authorize this service, please use the MCP Assistant chat - type "I need to authorize ${serviceId}"`,
          variant: "info",
          duration: 15000,
        });
      }
      
      // If there's a message in the response, show it
      if (data.message) {
        console.log(`Message from server: ${data.message}`);
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

  // Reset all connections
  const resetAllConnections = async () => {
    if (!confirm("Are you sure you want to reset all service connections? This cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, clear the UI state
      setConnectedServices([]);
      setServiceUrls({});
      setAuthLinks({});
      
      const supabase = createClient();
      
      // Get user session
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      if (!userData) {
        throw new Error("No user is logged in");
      }
      
      // First try to get the current connections to see what we need to remove
      const { data: userConnections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userData.id)
        .single();
      
      if (userConnections) {
        console.log("Resetting all connections:", JSON.stringify(userConnections, null, 2));
        
        // If there are connections, reset by directly updating the database
        const { error: updateError } = await supabase
          .from('user_connections')
          .update({
            config: {},
            connected_services: [],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.id);
        
        if (updateError) {
          console.error("Error resetting connections:", updateError);
          throw new Error("Failed to reset connections");
        }
      } else {
        console.log("No connections to reset");
      }
      
      // Finally, refresh connections from database
      await fetchUserConnections();
      
      addToast({
        title: "Connections Reset",
        description: "All service connections have been reset.",
        variant: "success",
        duration: 3000,
      });
      
      // Notify other components that connections have changed
      notifyConnectionChanged();
    } catch (error) {
      console.error("Error resetting connections:", error);
      addToast({
        title: "Reset Failed",
        description: "An error occurred while resetting connections. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a single connection
  const removeConnection = async (serviceId: string) => {
    const normalizedServiceId = normalizeServiceId(serviceId);
    console.log(`Removing connection for ${serviceId} (normalized: ${normalizedServiceId})`);
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/mcp-remove-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId: normalizedServiceId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove connection');
      }
      
      // First update the UI state
      setConnectedServices(prev => prev.filter(id => id !== normalizedServiceId));
      
      // Notify other components that connections have changed
      notifyConnectionChanged();
      
      // Remove from service URLs
      setServiceUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[normalizedServiceId];
        return newUrls;
      });
      
      // Remove from auth links
      setAuthLinks(prev => {
        const newLinks = { ...prev };
        delete newLinks[normalizedServiceId];
        return newLinks;
      });
      
      // Then refresh from the database
      await fetchUserConnections();
      
      addToast({
        title: "Connection Removed",
        description: `Successfully disconnected from ${serviceId}.`,
        variant: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error(`Error removing connection:`, error);
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to remove connection',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 text-blue-500 dark:text-white animate-spin" />
        <span className="ml-2 dark:text-white">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Auth mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold dark:text-white">Service Catalog</h2>
          <button
            onClick={() => {
              setIsLoading(true);
              // Clear all connection state before refreshing
              setConnectedServices([]);
              setServiceUrls({});
              setAuthLinks({});
              setTimeout(() => {
                fetchUserConnections().finally(() => setIsLoading(false));
              }, 100);
              addToast({
                title: "Refreshed",
                description: "Service connections have been refreshed.",
                variant: "success",
                duration: 3000,
              });
            }}
            className="ml-2 text-blue-500 hover:text-blue-700 dark:text-white dark:hover:text-white p-1 rounded-full hover:bg-blue-50 dark:hover:bg-black"
            title="Refresh service connections"
            aria-label="Refresh service connections"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={resetAllConnections}
            className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-black"
            title="Reset all connections"
            aria-label="Reset all connections"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Category tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => {
          // Normalize the service ID for comparison with our connected services list
          const normalizedServiceId = normalizeServiceId(service.id);
          const isConnected = connectedServices.includes(normalizedServiceId);
          const isConnecting = connectionInProgress === service.id;
          const authLink = authLinks[normalizedServiceId];
          const serverUrl = serviceUrls[normalizedServiceId];
          
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
                  connectToService(service.id);
                } else {
                  // If already connected, offer to disconnect
                  if (confirm(`Are you sure you want to disconnect from ${service.name}?`)) {
                    removeConnection(service.id);
                  }
                }
              }}
              onDisconnect={isConnected ? () => removeConnection(service.id) : undefined}
            />
          );
        })}
      </div>
      
      {filteredServices.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-white">
          No services found in this category.
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
        <a
          href="https://mcp.composio.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center"
        >
          View all services on mcp.composio.dev
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
} 