"use client"

import { cn } from "@/lib/utils"
import { EnhancedAIChat } from "./EnhancedAIChat"

interface AIChatSidebarProps {
  className?: string
}

export function AIChatSidebar({
  className
}: AIChatSidebarProps) {
  return (
    <div className={cn("flex h-full flex-col bg-background border-l", className)}>
      <EnhancedAIChat />
    </div>
  )
} 