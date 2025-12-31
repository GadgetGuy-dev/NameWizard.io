import React from "react";
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToastOptions = Partial<
  Pick<Toast, "id" | "title" | "description" | "action" | "variant">
>;

let count = 0;

export function generateToastId() {
  return `toast-${++count}`;
}

type ToasterToast = ToastOptions & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000; // 5 seconds

let toasts: ToasterToast[] = [];

type ToastActionTypes =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast>; id: string }
  | { type: "DISMISS_TOAST"; id?: string }
  | { type: "REMOVE_TOAST"; id: string };

let listeners: ((state: ToasterToast[]) => void)[] = [];

function dispatch(action: ToastActionTypes) {
  switch (action.type) {
    case "ADD_TOAST":
      toasts = [action.toast, ...toasts].slice(0, TOAST_LIMIT);
      break;
    case "UPDATE_TOAST":
      toasts = toasts.map((t) =>
        t.id === action.id ? { ...t, ...action.toast } : t
      );
      break;
    case "DISMISS_TOAST": {
      const { id } = action;
      if (id) {
        toasts = toasts.map((t) =>
          t.id === id ? { ...t, open: false } : t
        );
      } else {
        toasts = toasts.map((t) => ({ ...t, open: false }));
      }
      break;
    }
    case "REMOVE_TOAST": {
      const { id } = action;
      toasts = toasts.filter((t) => t.id !== id);
      break;
    }
  }

  listeners.forEach((listener) => listener(toasts));
}

// Toast function for direct imports
export const toast = (options: ToastOptions): string => {
  const id = options.id || generateToastId();
  const newToast = {
    ...options,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) {
        dismiss(id);
      }
    },
  };

  dispatch({ type: "ADD_TOAST", toast: newToast as ToasterToast });

  return id;
};

// Dismiss function for direct import
export const dismiss = (id?: string): void => {
  dispatch({ type: "DISMISS_TOAST", id });

  // Auto remove toast after delay
  if (id) {
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", id });
    }, TOAST_REMOVE_DELAY);
  }
};

// Update function for direct import
export const update = (id: string, options: ToastOptions): void => {
  dispatch({ type: "UPDATE_TOAST", id, toast: options });
};

// Hook for React components
export function useToast() {
  return {
    toast,
    update,
    dismiss,
    toasts: [...toasts],
  };
}

export function useToastSubscription(callback: (state: ToasterToast[]) => void) {
  React.useEffect(() => {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter((l) => l !== callback);
    };
  }, [callback]);
}