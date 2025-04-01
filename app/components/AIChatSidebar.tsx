"use client"

import { cn } from "@/lib/utils"
import { ChatWrapper } from "./ChatWrapper"

interface AIChatSidebarProps {
  className?: string
}

export function AIChatSidebar({
  className
}: AIChatSidebarProps) {
  return (
    <div className={cn("flex h-full flex-col bg-background border-l", className)}>
      <ChatWrapper 
        instructions={
          "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        }
        labels={{
          title: "MCP Assistant",
          initial: "Need any help?",
        }}
      />
    </div>
  )
} 