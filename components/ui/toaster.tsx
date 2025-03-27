"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "relative flex items-center gap-3 rounded-lg border p-4 shadow-lg",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        success: "border-emerald-500/50 bg-background text-foreground",
        error: "border-red-500/50 bg-background text-foreground",
        warning: "border-amber-500/50 bg-background text-foreground",
        info: "border-blue-500/50 bg-background text-foreground",
        destructive: "border-red-500/50 bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  onClose?: () => void
  action?: React.ReactNode
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      title,
      description,
      onClose,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = React.useMemo(() => {
      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-emerald-500" />
        case "error":
        case "destructive":
          return <AlertCircle className="h-5 w-5 text-red-500" />
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-amber-500" />
        case "info":
          return <Info className="h-5 w-5 text-blue-500" />
        default:
          return null
      }
    }, [variant])

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {Icon && <div className="shrink-0">{Icon}</div>}
        <div className="flex-1 space-y-1">
          {title && <div className="text-sm font-medium">{title}</div>}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
          {children}
        </div>
        {action && <div className="shrink-0">{action}</div>}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:bg-muted hover:text-foreground hover:opacity-100"
            aria-label="Close toast"
            title="Close toast"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

// Toaster component to manage multiple toasts
type ToastType = {
  id: string
  variant?: "default" | "success" | "error" | "warning" | "info" | "destructive"
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

interface ToasterProps {
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center"
}

const ToastContext = React.createContext<{
  toasts: ToastType[]
  addToast: (toast: Omit<ToastType, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastType[]>([])

  const addToast = React.useCallback(
    (toast: Omit<ToastType, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, ...toast }])

      if (toast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id)
        }, toast.duration || 5000)
      }
    },
    [setToasts]
  )

  const removeToast = React.useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    },
    [setToasts]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const Toaster = ({ position = "bottom-right" }: ToasterProps) => {
  const { toasts, removeToast } = useToast()

  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  }

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 p-4 max-w-[420px] w-full",
        positionClasses[position]
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          action={toast.action}
          onClose={() => removeToast(toast.id)}
          className="animate-in fade-in slide-in-from-bottom-5 duration-300"
        />
      ))}
    </div>
  )
} 