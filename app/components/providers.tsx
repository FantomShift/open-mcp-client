"use client";

import { Toaster, ToastProvider } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster position="bottom-right" />
    </ToastProvider>
  );
} 