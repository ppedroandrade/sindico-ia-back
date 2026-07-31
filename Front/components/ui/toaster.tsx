"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProgress,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const TOAST_DURATION = 5000;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <ToastIcon variant={variant} />
            <div className="flex-1 min-w-0">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            <ToastProgress variant={variant} duration={TOAST_DURATION} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
