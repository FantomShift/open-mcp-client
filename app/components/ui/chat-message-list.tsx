"use client"

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: string | boolean;
  children: React.ReactNode;
}

export const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, smooth = false, ...props }, _ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = React.useState(true);
    const [autoScrollEnabled, setAutoScrollEnabled] = React.useState(true);
    const lastContentHeightRef = React.useRef(0);

    // Convert string 'true'/'false' to boolean
    const shouldSmoothScroll = smooth === true || smooth === "true";

    const scrollToBottom = React.useCallback((instant?: boolean) => {
      if (!scrollRef.current) return;
      
      const targetScrollTop = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      
      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: shouldSmoothScroll ? "smooth" : "auto",
        });
      }
      
      setIsAtBottom(true);
      setAutoScrollEnabled(true);
    }, [shouldSmoothScroll]);

    const checkIsAtBottom = React.useCallback((element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(scrollHeight - scrollTop - clientHeight);
      return distanceToBottom <= 20;
    }, []);

    const handleScroll = React.useCallback(() => {
      if (!scrollRef.current) return;
      
      const atBottom = checkIsAtBottom(scrollRef.current);
      setIsAtBottom(atBottom);
      
      // Re-enable auto-scroll if at the bottom
      if (atBottom) {
        setAutoScrollEnabled(true);
      }
    }, [checkIsAtBottom]);

    const disableAutoScroll = React.useCallback(() => {
      const atBottom = scrollRef.current ? checkIsAtBottom(scrollRef.current) : false;
      
      // Only disable if not at bottom
      if (!atBottom) {
        setAutoScrollEnabled(false);
      }
    }, [checkIsAtBottom]);

    React.useEffect(() => {
      const element = scrollRef.current;
      if (!element) return;
      
      element.addEventListener("scroll", handleScroll, { passive: true });
      return () => element.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    React.useEffect(() => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;
      
      const currentHeight = scrollElement.scrollHeight;
      const hasNewContent = currentHeight !== lastContentHeightRef.current;
      
      if (hasNewContent && autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeightRef.current === 0);
        });
      }
      
      lastContentHeightRef.current = currentHeight;
    }, [children, autoScrollEnabled, scrollToBottom]);

    React.useEffect(() => {
      const element = scrollRef.current;
      if (!element) return;
      
      const resizeObserver = new ResizeObserver(() => {
        if (autoScrollEnabled) {
          scrollToBottom(true);
        }
      });
      
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, [autoScrollEnabled, scrollToBottom]);

    return (
      <div className="relative w-full h-full">
        <div
          className={cn("flex flex-col w-full h-full p-4 overflow-y-auto", className)}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <AnimatePresence>
            <div className="flex flex-col gap-6">
              {React.Children.map(children, (child, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1.0]
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>

        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => scrollToBottom()}
              size="icon"
              variant="outline"
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList"; 