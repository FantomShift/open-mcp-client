// MCPServiceIntegrationCard.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ExternalLink, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";

type StatusType = "connected" | "disconnected" | "error" | "connecting";

interface MCPServiceIntegrationCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  serviceName: string;
  description: string;
  logoSrc?: string;
  status: StatusType;
  lastUpdated?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  authLink?: string;
  serverUrl?: string;
}

const MCPServiceIntegrationCard = React.forwardRef<
  HTMLDivElement,
  MCPServiceIntegrationCardProps
>(
  (
    {
      className,
      serviceName,
      description,
      logoSrc,
      status,
      lastUpdated,
      onConnect,
      onDisconnect,
      authLink,
      serverUrl,
      ...props
    },
    ref
  ) => {
    const { addToast } = useToast();
    
    const statusColors = {
      connected: "bg-green-500",
      disconnected: "bg-zinc-400 dark:bg-zinc-600",
      error: "bg-red-500",
      connecting: "bg-blue-500 dark:bg-gray-500",
    };

    const statusText = {
      connected: "Connected",
      disconnected: "Disconnected",
      error: "Connection Error",
      connecting: "Connecting...",
    };

    // Log auth link for debugging
    React.useEffect(() => {
      if (authLink) {
        console.log(`Auth link for ${serviceName}:`, authLink);
      }
    }, [authLink, serviceName]);

    // Generate a letter avatar if no logo is provided
    const logoDisplay = logoSrc ? (
      <img
        src={logoSrc}
        alt={`${serviceName} logo`}
        className="h-10 w-10 object-contain"
      />
    ) : (
      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-lg font-semibold text-blue-600 dark:text-white">
          {serviceName.charAt(0).toUpperCase()}
        </span>
      </div>
    );

    return (
      <Card
        ref={ref}
        className={cn(
          "w-full h-[200px] relative border rounded-lg border-zinc-200 dark:border-gray-800 bg-card dark:bg-black hover:shadow-md transition-all duration-200",
          authLink && "border-blue-400 dark:border-gray-700 ring-2 ring-blue-200 dark:ring-gray-800",
          className
        )}
        {...props}
      >
        <CardContent className="p-6 flex flex-col h-full">
          {/* Card top section - logo and info */}
          <div className="flex items-start gap-4 flex-shrink-0">
            <div className="relative h-12 w-12 flex-shrink-0 rounded-md bg-zinc-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {logoDisplay}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-foreground dark:text-white line-clamp-1">
                  {serviceName}
                </h3>
                <div className="flex items-center flex-shrink-0">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      authLink && status === "connected" ? "bg-amber-500" : statusColors[status]
                    )}
                  />
                  <span className="ml-1.5 text-xs text-muted-foreground dark:text-gray-400 whitespace-nowrap">
                    {statusText[status]}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Card bottom section - actions */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
            {status === "connected" ? (
              <>
                {authLink && (
                  <a 
                    href={authLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-black dark:hover:bg-gray-800 text-white font-medium text-xs h-8 px-3 rounded transition-colors"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" /> Authorize via Composio
                  </a>
                )}
                {!authLink && status === "connected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-blue-600 dark:text-white border-blue-200 dark:border-gray-700"
                    onClick={() => {
                      // Open the chat
                      const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement;
                      if (chatButton) chatButton.click();
                      
                      // Add message to inform user
                      addToast({
                        title: "Use Chat Assistant",
                        description: `Type "I need to authorize ${serviceName}" in the chat to get authorization help.`,
                        variant: "info",
                        duration: 8000,
                      });
                    }}
                  >
                    Use MCP Chat
                  </Button>
                )}
                {onDisconnect && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-red-500 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
                    onClick={onDisconnect}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Disconnect
                  </Button>
                )}
              </>
            ) : status === "error" ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 text-red-500 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
                onClick={onConnect}
              >
                <AlertCircle className="mr-1 h-3 w-3" /> Retry Connection
              </Button>
            ) : status === "connecting" ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 dark:border-gray-700 dark:text-gray-400"
                disabled
              >
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting...
              </Button>
            ) : (
              <Button
                size="sm"
                className="text-xs h-8"
                onClick={onConnect}
              >
                <ExternalLink className="mr-1 h-3 w-3" /> Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

MCPServiceIntegrationCard.displayName = "MCPServiceIntegrationCard";

export { MCPServiceIntegrationCard }; 