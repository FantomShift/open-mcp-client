"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { ReactNode } from "react";

interface ChatWrapperProps {
  instructions?: string;
  labels?: {
    title?: string;
    initial?: string;
  };
}

export function ChatWrapper({ instructions, labels }: ChatWrapperProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden relative copilot-chat-wrapper">
        <CopilotChat
          className="h-full flex flex-col overflow-hidden"
          instructions={instructions || "You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
          labels={{
            title: labels?.title || "Chat Assistant",
            initial: labels?.initial || "How can I help you today?",
          }}
        />
      </div>
      <style jsx global>{`
        .copilot-chat-wrapper :global(.copilotkit-chat-messages-container) {
          overflow-y: auto;
          max-height: calc(100% - 120px);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-input-container) {
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 10;
        }
        
        /* Dark mode support */
        .dark .copilot-chat-wrapper :global(.copilotkit-chat-input-container) {
          background: black;
        }
      `}</style>
    </div>
  );
} 