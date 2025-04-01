"use client";

import { useState, useEffect } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Settings, 
  MessageSquare, 
  Database, 
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";

type ConnectionType = "stdio" | "sse";

interface StdioConfig {
  command: string;
  args: string[];
  transport: "stdio";
}

interface SSEConfig {
  url: string;
  transport: "sse";
}

type ServerConfig = StdioConfig | SSEConfig;

// Define a generic type for our state
interface AgentState {
  mcp_config: Record<string, ServerConfig>;
}

// Local storage key for saving agent state
const STORAGE_KEY = "mcp-agent-state";

export function UserFriendlyConfigForm() {
  // Use our localStorage hook for persistent storage
  const [savedConfigs, setSavedConfigs] = useLocalStorage<
    Record<string, ServerConfig>
  >(STORAGE_KEY, {});

  // Initialize agent state with the data from localStorage
  const { state: agentState, setState: setAgentState } = useCoAgent<AgentState>(
    {
      name: "sample_agent",
      initialState: {
        mcp_config: savedConfigs,
      },
    }
  );

  // Simple getter for configs
  const configs = agentState?.mcp_config || {};

  // Simple setter wrapper for configs
  const setConfigs = (newConfigs: Record<string, ServerConfig>) => {
    setAgentState({ ...agentState, mcp_config: newConfigs });
    setSavedConfigs(newConfigs);
    saveToSupabase(newConfigs);
  };

  const [serverName, setServerName] = useState("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("stdio");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate server statistics
  const totalConnections = Object.keys(configs).length;
  const commandLineTools = Object.values(configs).filter(
    (config) => config.transport === "stdio"
  ).length;
  const webServices = Object.values(configs).filter(
    (config) => config.transport === "sse"
  ).length;

  // Fetch user and their saved connections
  useEffect(() => {
    const fetchUserAndConnections = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Get user session
        const { data: { user: userData } } = await supabase.auth.getUser();
        
        if (userData) {
          setUser(userData);
          
          // Fetch user's connections from database
          const { data: connections, error } = await supabase
            .from('user_connections')
            .select('*')
            .eq('user_id', userData.id)
            .single();
            
          if (connections && connections.config) {
            // Set state from database
            setAgentState({ ...agentState, mcp_config: connections.config });
            setSavedConfigs(connections.config);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndConnections();
  }, []);

  // Save configurations to Supabase
  const saveToSupabase = async (newConfigs: Record<string, ServerConfig>) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      
      // Upsert the configuration
      const { error } = await supabase
        .from('user_connections')
        .upsert({
          user_id: user.id,
          config: newConfigs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
        
      if (error) throw error;
      
    } catch (error) {
      console.error("Error saving configurations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addConnection = () => {
    if (!serverName) return;

    const newConfig =
      connectionType === "stdio"
        ? {
            command,
            args: args.split(" ").filter((arg) => arg.trim() !== ""),
            transport: "stdio" as const,
          }
        : {
            url,
            transport: "sse" as const,
          };

    setConfigs({
      ...configs,
      [serverName]: newConfig,
    });

    // Reset form
    setServerName("");
    setCommand("");
    setArgs("");
    setUrl("");
    setShowAddServiceForm(false);
  };

  const removeConnection = (name: string) => {
    const newConfigs = { ...configs };
    delete newConfigs[name];
    setConfigs(newConfigs);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 text-blue-500 dark:text-white animate-spin mb-2" />
          <p className="dark:text-dark-muted">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Your Connected Services</h1>
          <p className="text-muted-foreground dark:text-dark-muted">Manage the tools and services connected to your assistant</p>
        </div>
        <Button onClick={() => setShowAddServiceForm(true)} className="h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Connect a Service
        </Button>
      </div>

      {/* Connection Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="dark:bg-black dark:border-dark-DEFAULT">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">{totalConnections}</div>
            <p className="text-sm text-muted-foreground dark:text-dark-muted">Connected to your assistant</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-dark-DEFAULT">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Command Line Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">{commandLineTools}</div>
            <p className="text-sm text-muted-foreground dark:text-dark-muted">Local applications</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-black dark:border-dark-DEFAULT">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Web Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">{webServices}</div>
            <p className="text-sm text-muted-foreground dark:text-dark-muted">Cloud-based connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Services List */}
      <Card className="dark:bg-black dark:border-dark-DEFAULT">
        <CardHeader>
          <CardTitle className="dark:text-white">Your Services</CardTitle>
          <CardDescription className="dark:text-dark-muted">Tools and applications connected to your virtual assistant</CardDescription>
        </CardHeader>
        <CardContent>
          {totalConnections === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No services connected yet</h3>
              <p className="text-muted-foreground dark:text-dark-muted mb-4">
                Connect your first service to start interacting with it through your assistant
              </p>
              <Button onClick={() => setShowAddServiceForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Connect a Service
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {Object.entries(configs).map(([name, config]) => (
                <div key={name} className="flex items-center justify-between p-4 border dark:border-dark-DEFAULT rounded-lg dark:bg-black">
                  <div className="flex items-center gap-3">
                    {config.transport === "stdio" ? (
                      <div className="p-2 bg-blue-100 dark:bg-gray-800 rounded-full">
                        <Settings className="h-5 w-5 text-blue-600 dark:text-white" />
                      </div>
                    ) : (
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium dark:text-white">{name}</h3>
                        <Badge variant={config.transport === "stdio" ? "secondary" : "default"} className="dark:bg-gray-800 dark:text-gray-200">
                          {config.transport === "stdio" ? "Command Line" : "Web Service"}
                        </Badge>
                        <Badge variant="outline" className="border-green-200 dark:border-green-900 text-green-800 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">
                        {config.transport === "stdio" 
                          ? `Command: ${config.command} ${config.args.join(" ")}` 
                          : `URL: ${config.url}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeConnection(name)}
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Service Modal */}
      {showAddServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black dark:border dark:border-dark-DEFAULT rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center dark:text-white">
                <Plus className="w-5 h-5 mr-2" />
                Connect a New Service
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAddServiceForm(false)}
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName" className="dark:text-white">Service Name</Label>
                <Input
                  id="serviceName"
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full dark:bg-black dark:border-dark-DEFAULT dark:text-white"
                  placeholder="e.g., Email Service, Google Drive, Slack"
                />
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  Give your service a recognizable name
                </p>
              </div>

              <div>
                <Label className="dark:text-white">Connection Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setConnectionType("stdio")}
                    className={`px-4 py-3 border rounded-md text-center flex flex-col items-center justify-center gap-2 dark:border-dark-DEFAULT ${
                      connectionType === "stdio"
                        ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        : "bg-white dark:bg-black text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-hover"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Command Line</span>
                    <span className="text-xs text-gray-500 dark:text-dark-muted">Local applications</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionType("sse")}
                    className={`px-4 py-3 border rounded-md text-center flex flex-col items-center justify-center gap-2 dark:border-dark-DEFAULT ${
                      connectionType === "sse"
                        ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        : "bg-white dark:bg-black text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-hover"
                    }`}
                  >
                    <Database className="w-5 h-5" />
                    <span className="text-sm font-medium">Web Service</span>
                    <span className="text-xs text-gray-500 dark:text-dark-muted">Cloud APIs</span>
                  </button>
                </div>
              </div>

              {connectionType === "stdio" ? (
                <>
                  <div>
                    <Label htmlFor="command" className="dark:text-white">Command</Label>
                    <Input
                      id="command"
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="w-full dark:bg-black dark:border-dark-DEFAULT dark:text-white"
                      placeholder="e.g., python, node"
                    />
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                      The program to execute (e.g., python, node)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="arguments" className="dark:text-white">Arguments</Label>
                    <Input
                      id="arguments"
                      type="text"
                      value={args}
                      onChange={(e) => setArgs(e.target.value)}
                      className="w-full dark:bg-black dark:border-dark-DEFAULT dark:text-white"
                      placeholder="e.g., script.py --flag value"
                    />
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                      Any arguments to pass to the command
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="url" className="dark:text-white">Service URL</Label>
                  <Input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full dark:bg-black dark:border-dark-DEFAULT dark:text-white"
                    placeholder="e.g., https://api.example.com/events"
                  />
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                    The URL endpoint of the web service
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddServiceForm(false)}
                  className="dark:border-dark-DEFAULT dark:text-dark-muted dark:hover:bg-dark-hover"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addConnection}
                  disabled={!serverName || (connectionType === "stdio" ? !command : !url)}
                >
                  Connect Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md flex items-center">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Saving your connections...
        </div>
      )}
    </div>
  );
} 