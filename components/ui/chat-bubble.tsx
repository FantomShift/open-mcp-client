"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface ChatBubbleProps {
  variant?: "sent" | "received";
  className?: string;
  children: React.ReactNode;
}

export function ChatBubble({
  variant = "received",
  className,
  children,
  ...props
}: ChatBubbleProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full gap-3 p-3",
        variant === "sent" && "justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ChatBubbleAvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

export function ChatBubbleAvatar({
  src,
  fallback,
  className,
  ...props
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)} {...props}>
      {src && <AvatarImage src={src} alt={fallback || "Avatar"} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading = false,
  className,
  children,
  ...props
}: ChatBubbleMessageProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl px-4 py-2.5 text-sm",
        variant === "sent"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 h-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75 [animation-delay:150ms]"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75 [animation-delay:300ms]"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
          </span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface ChatBubbleActionWrapperProps {
  className?: string;
  children: React.ReactNode;
}

export function ChatBubbleActionWrapper({
  className,
  children,
  ...props
}: ChatBubbleActionWrapperProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-end gap-2 max-w-[75%] ms-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ChatBubbleActionProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ChatBubbleAction({
  icon,
  onClick,
  className,
}: ChatBubbleActionProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        className
      )}
      onClick={onClick}
    >
      {icon}
    </button>
  );
} 