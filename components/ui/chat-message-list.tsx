"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
  className?: string;
  children: React.ReactNode;
}

export function ChatMessageList({
  className,
  children,
  ...props
}: ChatMessageListProps & React.HTMLAttributes<HTMLDivElement>) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [children]);

  return (
    <div
      className={cn("flex h-full flex-col space-y-2 overflow-y-auto p-3", className)}
      {...props}
    >
      {children}
      <div ref={messagesEndRef} />
    </div>
  );
} 