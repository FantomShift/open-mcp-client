"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { ReactNode, useEffect } from "react";
import { useTheme } from "./providers";

interface ChatWrapperProps {
  instructions?: string;
  labels?: {
    title?: string;
    initial?: string;
  };
}

export function ChatWrapper({ instructions, labels }: ChatWrapperProps) {
  const { theme } = useTheme();
  
  // Update chat theme when the app theme changes
  useEffect(() => {
    // Add a class to the document root for the chat component to reference
    if (theme === 'dark') {
      document.documentElement.classList.add('copilot-dark-theme');
    } else {
      document.documentElement.classList.remove('copilot-dark-theme');
    }
  }, [theme]);
  
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
        :root {
          --copilot-chat-bg: white;
          --copilot-chat-text: #1a1a1a;
          --copilot-chat-border: #e5e7eb;
          --copilot-chat-user-bubble: #2563eb;
          --copilot-chat-user-text: white;
          --copilot-chat-bot-bubble: #f3f4f6;
          --copilot-chat-bot-text: #1a1a1a;
          --copilot-chat-input-bg: white;
          --copilot-chat-input-text: #1a1a1a;
          --copilot-chat-input-border: #e5e7eb;
          --copilot-chat-input-placeholder: #9ca3af;
        }

        .copilot-dark-theme {
          --copilot-chat-bg: #121212;
          --copilot-chat-text: #e5e7eb;
          --copilot-chat-border: #374151;
          --copilot-chat-user-bubble: #2563eb;
          --copilot-chat-user-text: white;
          --copilot-chat-bot-bubble: #1f2937;
          --copilot-chat-bot-text: #e5e7eb;
          --copilot-chat-input-bg: #1f2937;
          --copilot-chat-input-text: #e5e7eb;
          --copilot-chat-input-border: #374151;
          --copilot-chat-input-placeholder: #9ca3af;
        }
      
        .copilot-chat-wrapper {
          color-scheme: light dark;
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-messages-container) {
          overflow-y: auto;
          max-height: calc(100% - 120px);
          background-color: var(--copilot-chat-bg);
          color: var(--copilot-chat-text);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-input-container) {
          position: sticky;
          bottom: 0;
          background: var(--copilot-chat-input-bg);
          border-top: 1px solid var(--copilot-chat-border);
          z-index: 10;
          color: var(--copilot-chat-input-text);
        }

        .copilot-chat-wrapper :global(.copilotkit-chat-container) {
          background-color: var(--copilot-chat-bg);
          color: var(--copilot-chat-text);
          border-color: var(--copilot-chat-border);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-input) {
          background-color: var(--copilot-chat-input-bg);
          color: var(--copilot-chat-input-text);
          border-color: var(--copilot-chat-input-border);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-input::placeholder) {
          color: var(--copilot-chat-input-placeholder);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-message-user) {
          background-color: var(--copilot-chat-user-bubble);
          color: var(--copilot-chat-user-text);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-message-bot) {
          background-color: var(--copilot-chat-bot-bubble);
          color: var(--copilot-chat-bot-text);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-chat-header) {
          background-color: var(--copilot-chat-bg);
          color: var(--copilot-chat-text);
          border-bottom: 1px solid var(--copilot-chat-border);
        }
        
        .copilot-chat-wrapper :global(.copilotkit-send-button) {
          background-color: var(--copilot-chat-user-bubble);
          color: var(--copilot-chat-user-text);
        }
      `}</style>
    </div>
  );
} 