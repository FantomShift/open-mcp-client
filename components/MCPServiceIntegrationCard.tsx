// MCPServiceIntegrationCard.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StatusType = "connected" | "disconnected" | "error" | "connecting";

interface MCPServiceIntegrationCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  serviceName: string;
  description: string;
  logoSrc?: string;
  status: StatusType;
  lastUpdated?: string;
  onConnect?: () => void;
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
      authLink,
      serverUrl,
      ...props
    },
    ref
  ) => {
    const statusColors = {
      connected: "bg-green-500",
      disconnected: "bg-zinc-400 dark:bg-zinc-600",
      error: "bg-red-500",
      connecting: "bg-blue-500",
    };

    const statusText = {
      connected: "Connected",
      disconnected: "Disconnected",
      error: "Connection Error",
      connecting: "Connecting...",
    };

    // Generate a letter avatar if no logo is provided
    const logoDisplay = logoSrc ? (
      <img
        src={logoSrc}
        alt={`${serviceName} logo`}
        className="h-10 w-10 object-contain"
      />
    ) : (
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-lg font-semibold text-blue-600">
          {serviceName.charAt(0).toUpperCase()}
        </span>
      </div>
    );

    return (
      <Card
        ref={ref}
        className={cn(
          "w-full relative border rounded-lg border-zinc-200 dark:border-zinc-800 bg-background hover:shadow-md transition-all duration-200",
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 flex-shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
              {logoDisplay}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-foreground">
                      {serviceName}
                    </h3>
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          statusColors[status]
                        )}
                      />
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {statusText[status]}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {status === "connected" ? (
                <div className="flex flex-col items-end">
                  {serverUrl && (
                    <p className="text-xs text-gray-500 mb-1">
                      URL: {serverUrl}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={onConnect}
                  >
                    <Check className="mr-1 h-3 w-3" /> Connected
                  </Button>
                </div>
              ) : status === "error" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50"
                  onClick={onConnect}
                >
                  <AlertCircle className="mr-1 h-3 w-3" /> Retry Connection
                </Button>
              ) : status === "connecting" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  disabled
                >
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting...
                </Button>
              ) : authLink ? (
                // Display auth link like an agent would in chat
                <div className="text-sm flex flex-col items-end">
                  <p className="text-gray-600 mb-1">To connect, click this authorization link:</p>
                  <a 
                    href={authLink} 
                    className="text-blue-500 hover:text-blue-600 underline inline-flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" /> Authorize {serviceName}
                  </a>
                </div>
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
          </div>
        </CardContent>
      </Card>
    );
  }
);

MCPServiceIntegrationCard.displayName = "MCPServiceIntegrationCard";

export { MCPServiceIntegrationCard }; 