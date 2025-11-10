"use client";

import * as React from "react";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

type ToastMessage = {
  id: number;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

const ToastContext = React.createContext<{
  publish: (message: Omit<ToastMessage, "id">) => void;
}>({ publish: () => undefined });

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ToastMessage[]>([]);

  const publish = React.useCallback((message: Omit<ToastMessage, "id">) => {
    setMessages((current) => [...current, { ...message, id: Date.now() }]);
  }, []);

  const handleOpenChange = React.useCallback((id: number, open: boolean) => {
    if (!open) {
      setMessages((current) => current.filter((toast) => toast.id !== id));
    }
  }, []);

  return (
    <ToastContext.Provider value={{ publish }}>
      <ToastProvider swipeDirection="right">
        {children}
        <ToastViewport />
        {messages.map((toast) => (
          <Toast key={toast.id} open={true} onOpenChange={(open) => handleOpenChange(toast.id, open)}>
            <div className="flex flex-1 flex-col gap-1">
              {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
              {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
            </div>
            {toast.action ? <ToastAction altText="Dismiss">{toast.action}</ToastAction> : null}
            <ToastClose />
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
