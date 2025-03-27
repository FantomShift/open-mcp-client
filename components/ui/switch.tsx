"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            {...props}
          />
          <div 
            className={cn(
              "block w-10 h-6 bg-gray-200 rounded-full",
              props.checked && "bg-blue-500",
              className
            )}
          />
          <div className={cn(
            "dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition",
            props.checked && "transform translate-x-4"
          )} />
        </div>
        {label && <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>}
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch } 