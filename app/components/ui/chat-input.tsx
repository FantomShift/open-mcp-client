"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  errorMessage?: string;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, errorMessage, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);

    const combinedRef = (node: HTMLTextAreaElement) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      innerRef.current = node;
    };

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onChange) {
          onChange(e);
        }
        
        // Auto-resize the textarea
        if (innerRef.current) {
          // Reset height to auto to get the correct scrollHeight
          innerRef.current.style.height = 'auto';
          // Set height to scrollHeight to expand the textarea
          innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
        }
      },
      [onChange]
    );

    // Set initial height on mount and when value changes directly
    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.style.height = 'auto';
        innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
      }
    }, [props.value]);

    return (
      <div className="w-full">
        <Textarea
          ref={combinedRef}
          onChange={handleChange}
          rows={1}
          className={cn(
            "min-h-[40px] max-h-[200px] w-full resize-none overflow-hidden text-base py-3 transition-all",
            errorMessage && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {errorMessage && (
          <p className="text-sm font-medium text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export { ChatInput }; 