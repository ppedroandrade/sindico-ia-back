"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import {
  API_URL,
  apiRequest,
  type Notification,
  type NotificationKind,
  type NotificationResponse,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const toastStyles: Record<
  NotificationKind,
  {
    icon: typeof Info;
    color: string;
    variant: "info" | "success" | "warning" | "destructive";
  }
> = {
  info: { icon: Info, color: "text-primary", variant: "info" },
  success: { icon: CheckCircle2, color: "text-success", variant: "success" },
  warning: { icon: AlertTriangle, color: "text-warning", variant: "warning" },
  error: {
    icon: CircleAlert,
    color: "text-destructive",
    variant: "destructive",
  },
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const seenIds = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    try {
      const response = (await apiRequest(
        "/notifications",
      )) as NotificationResponse;
      const freshUnread = response.notifications.filter(
        (notification) =>
          !notification.readAt && !seenIds.current.has(notification.id),
      );

      if (initialized.current) {
        freshUnread
          .slice(0, 3)
          .reverse()
          .forEach((notification) => {
            const style = toastStyles[notification.type] ?? toastStyles.info;
            const Icon = style.icon;
            toast({
              variant: style.variant,
              title: (
                <span className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${style.color}`} />
                  {notification.title}
                </span>
              ),
              description: notification.description,
            });
          });
      }

      response.notifications.forEach((notification) =>
        seenIds.current.add(notification.id),
      );
      initialized.current = true;
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch {
      // Notifications are supplementary and must not block the dashboard.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 12000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const abortController = new AbortController();
    async function listen() {
      try {
        const response = await fetch(`${API_URL}/notifications/stream`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });
        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!abortController.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            const data = event
              .split("\n")
              .find((line) => line.startsWith("data:"))
              ?.slice(5)
              .trim();
            if (!data) continue;
            try {
              if (JSON.parse(data).refresh) void refresh();
            } catch {
              // Ignore malformed stream messages and keep the connection alive.
            }
          }
        }
      } catch {
        // The polling fallback keeps notifications working if the stream disconnects.
      }
    }

    void listen();
    return () => abortController.abort();
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await apiRequest("/notifications/read-all", { method: "PATCH" });
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? readAt,
      })),
    );
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refresh,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationProvider",
    );
  return context;
}
