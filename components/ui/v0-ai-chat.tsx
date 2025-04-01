"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCoAgent } from "@copilotkit/react-core";
import {
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    Mail,
    Calendar,
    FileText,
    CheckSquare,
    Loader2
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

// Define message types
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [localMessages, setLocalMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm ready for instructions." }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    // Use CopilotKit's agent hook
    const agent = useCoAgent({
        name: "sample_agent",
        initialMessages: [
            {
                role: "assistant",
                content: "Hi! I'm ready for instructions."
            }
        ]
    });

    // Get agent methods and state
    const sendMessage = agent.sendMessage || agent.submitMessage || agent.getResponse;
    const agentMessages = agent.messages || [];
    const isLoading = agent.isLoading || false;
    
    // Log agent object for debugging
    useEffect(() => {
        console.log("Agent object:", agent);
    }, [agent]);

    // Synchronize CopilotKit messages with our UI
    useEffect(() => {
        if (agentMessages && agentMessages.length > 0) {
            const formattedMessages = agentMessages.map(message => ({
                role: message.role as 'user' | 'assistant',
                content: message.content
            }));
            setLocalMessages(formattedMessages);
        }
    }, [agentMessages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (value.trim() && !isLoading && sendMessage) {
            // Get trimmed message
            const messageText = value.trim();
            
            // Clear input
            setValue("");
            adjustHeight(true);
            
            // Add user message to local state immediately for better UX
            setLocalMessages(prev => [...prev, { role: 'user', content: messageText }]);
            
            try {
                // Submit to CopilotKit
                await sendMessage(messageText);
            } catch (error) {
                console.error("Error sending message:", error);
                // Add error message
                setLocalMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: "Sorry, there was an error communicating with the agent server. Make sure it's running at http://localhost:8123."
                }]);
            }
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages]);

    return (
        <div className="flex flex-col w-full h-full mx-auto p-4">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {localMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={cn(
                            "inline-flex items-start gap-2 px-4 py-2 rounded-lg max-w-[80%]",
                            message.role === 'user' 
                                ? "bg-blue-600 text-white" 
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                        )}>
                            {message.role === 'assistant' && (
                                <CircleUserRound className="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400" />
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                            <p className="text-sm">Thinking...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="w-full mt-auto">
                <div className="relative bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question..."
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-gray-900 dark:text-white text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-gray-400 dark:placeholder:text-neutral-500 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                                disabled={isLoading}
                            >
                                <Paperclip className="w-4 h-4 text-gray-500 dark:text-white" />
                                <span className="text-xs text-gray-500 dark:text-zinc-400 hidden group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-2 py-1 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-1"
                                disabled={isLoading}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Project
                            </button>
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={isLoading || !value.trim()}
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 flex items-center justify-between gap-1",
                                    (value.trim() && !isLoading)
                                        ? "bg-blue-600 text-white dark:bg-white dark:text-black border-transparent"
                                        : "text-gray-400 dark:text-zinc-400"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowUpIcon
                                        className={cn(
                                            "w-4 h-4",
                                            value.trim()
                                                ? "text-white dark:text-black"
                                                : "text-gray-400 dark:text-zinc-400"
                                        )}
                                    />
                                )}
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <ActionButton
                        icon={<Mail className="w-4 h-4" />}
                        label="Check unread emails"
                        onClick={() => {
                            setValue("Check my unread emails");
                            setTimeout(() => handleSendMessage(), 100);
                        }}
                        disabled={isLoading}
                    />
                    <ActionButton
                        icon={<Calendar className="w-4 h-4" />}
                        label="Summarize schedule"
                        onClick={() => {
                            setValue("Summarize my schedule for today");
                            setTimeout(() => handleSendMessage(), 100);
                        }}
                        disabled={isLoading}
                    />
                    <ActionButton
                        icon={<FileText className="w-4 h-4" />}
                        label="Latest meeting minutes"
                        onClick={() => {
                            setValue("Get the latest meeting minutes");
                            setTimeout(() => handleSendMessage(), 100);
                        }}
                        disabled={isLoading}
                    />
                    <ActionButton
                        icon={<CheckSquare className="w-4 h-4" />}
                        label="Scan for To Do"
                        onClick={() => {
                            setValue("Scan my emails for to-do items");
                            setTimeout(() => handleSendMessage(), 100);
                        }}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}

function ActionButton({ icon, label, onClick, disabled }: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-white transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}


