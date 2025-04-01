"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, ArrowDown, Check, AlertTriangle, Loader2 } from "lucide-react";

type ToolCallRendererProps = {
  name: string;
  args: any;
  status: string;
  result: any;
};

export const ToolCallRenderer: React.FC<ToolCallRendererProps> = ({
  name,
  args,
  status,
  result,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format JSON objects for display
  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  // Status icons and colors
  const statusConfig: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
    running: { 
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, 
      bgColor: "bg-yellow-100 dark:bg-yellow-900/40", 
      textColor: "text-yellow-800 dark:text-yellow-400" 
    },
    success: { 
      icon: <Check className="h-3.5 w-3.5" />, 
      bgColor: "bg-green-100 dark:bg-green-900/40", 
      textColor: "text-green-800 dark:text-green-400" 
    },
    error: { 
      icon: <AlertTriangle className="h-3.5 w-3.5" />, 
      bgColor: "bg-red-100 dark:bg-red-900/40", 
      textColor: "text-red-800 dark:text-red-400" 
    },
    pending: { 
      icon: <ArrowDown className="h-3.5 w-3.5" />, 
      bgColor: "bg-blue-100 dark:bg-gray-800", 
      textColor: "text-blue-800 dark:text-white" 
    },
  };

  const { icon, bgColor, textColor } = 
    statusConfig[status.toLowerCase()] || 
    { icon: <Code className="h-3.5 w-3.5" />, bgColor: "bg-gray-100 dark:bg-black", textColor: "text-gray-800 dark:text-white" };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-2 rounded-lg border border-gray-200 dark:border-dark-DEFAULT overflow-hidden shadow-sm dark:shadow-none"
    >
      {/* Header - always visible */}
      <motion.div 
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        onClick={toggleExpand}
        whileHover={{ backgroundColor: "rgba(var(--color-accent), 0.1)" }}
      >
        <div className="flex items-center space-x-3">
          <div className="font-medium text-gray-700 dark:text-true-white">{name}</div>
          <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1.5 ${bgColor} ${textColor}`}>
            {icon}
            <span>{status}</span>
          </div>
        </div>
        <motion.button 
          className="text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-true-white focus:outline-none transition-transform transform"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* Details - visible when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t border-gray-200 dark:border-dark-DEFAULT bg-white dark:bg-true-black">
              {/* Arguments Section */}
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-1">Arguments:</div>
                <pre className="text-xs bg-gray-50 dark:bg-black p-3 rounded-md overflow-auto max-h-40 border border-gray-100 dark:border-dark-DEFAULT">
                  <code className="text-gray-800 dark:text-true-white">{formatJSON(args)}</code>
                </pre>
              </div>

              {/* Result Section - shown only if there's a result */}
              {result && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-1">Result:</div>
                  <pre className="text-xs bg-gray-50 dark:bg-black p-3 rounded-md overflow-auto max-h-40 border border-gray-100 dark:border-dark-DEFAULT">
                    <code className="text-gray-800 dark:text-true-white">{formatJSON(result)}</code>
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 