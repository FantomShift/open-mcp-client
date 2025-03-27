"use client";

import * as React from "react";
import { useState, useRef, FormEvent } from "react";
import { 
  Paperclip, 
  Mic, 
  CornerDownLeft, 
  Image as ImageIcon, 
  File, 
  Clock, 
  Check, 
  CheckCheck,
  SmilePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleActionWrapper
} from "@/components/ui/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { ChatInput } from "@/components/ui/chat-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MessageType = "text" | "image" | "file";

export interface MessageAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name?: string;
  size?: string;
  previewUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isCurrentUser: boolean;
  };
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read";
  type: MessageType;
  attachments?: MessageAttachment[];
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string, attachments?: MessageAttachment[]) => void;
  className?: string;
  userAvatar?: string;
  botAvatar?: string;
}

export function ChatInterface({
  messages: initialMessages = [],
  onSendMessage,
  className,
  userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop",
  botAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: {
        id: "user",
        name: "You",
        avatar: userAvatar,
        isCurrentUser: true,
      },
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
      type: "text",
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setAttachments([]);
    onSendMessage?.(input, attachments);

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg
        )
      );
    }, 1500);

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thanks for your message! I'll get back to you soon.",
          sender: {
            id: "bot",
            name: "Assistant",
            avatar: botAvatar,
            isCurrentUser: false,
          },
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "delivered",
          type: "text",
        };
        
        setMessages((prev) => [...prev, botResponse]);
      }, 2000);
    }, 1000);
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: MessageAttachment[] = Array.from(files).map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: Math.random().toString(36).substring(2, 9),
        type: isImage ? "image" : "file",
        url: URL.createObjectURL(file),
        name: file.name,
        size: formatFileSize(file.size),
        previewUrl: isImage ? URL.createObjectURL(file) : undefined
      };
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset the input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const renderMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-500" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.type === "image") {
      return (
        <div className="relative rounded-md overflow-hidden mt-2 max-w-[240px]">
          <img 
            src={attachment.url} 
            alt={attachment.name || "Image attachment"} 
            className="w-full h-auto object-cover rounded-md"
          />
          {attachment.name && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
              {attachment.name}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md mt-2">
          <File className="h-8 w-8 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-gray-500">{attachment.size}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={cn("h-[600px] border bg-white rounded-lg flex flex-col", className)}>
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={botAvatar} />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">Chat Assistant</h3>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender.isCurrentUser ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={message.sender.avatar}
                fallback={message.sender.isCurrentUser ? "US" : "AI"}
              />
              <div className="flex flex-col max-w-[80%]">
                <ChatBubbleMessage
                  variant={message.sender.isCurrentUser ? "sent" : "received"}
                >
                  {message.content}
                  {message.attachments?.map((attachment) => (
                    <div key={attachment.id}>
                      {renderAttachment(attachment)}
                    </div>
                  ))}
                </ChatBubbleMessage>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 self-end">
                  {message.timestamp}
                  {message.sender.isCurrentUser && (
                    <span className="ml-1">{renderMessageStatus(message.status)}</span>
                  )}
                </div>
              </div>
            </ChatBubble>
          ))}

          {isTyping && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={botAvatar}
                fallback="AI"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="p-4 border-t">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="relative group">
                {attachment.type === "image" ? (
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                    <img 
                      src={attachment.url} 
                      alt={attachment.name || "Attachment"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                    <File className="h-8 w-8 text-blue-500" />
                  </div>
                )}
                <button 
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-white focus-within:ring-1 focus-within:ring-gray-400 p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-12 resize-none rounded-lg bg-white border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
                aria-label="Attach file"
              >
                <Paperclip className="size-4" />
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
                title="File upload"
                aria-label="File upload"
              />

              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label="Upload image"
              >
                <ImageIcon className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label="Add emoji"
              >
                <SmilePlus className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label="Record audio"
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5">
              Send
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 