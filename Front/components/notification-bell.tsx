"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  CircleAlert,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/components/notification-context";
import type { Notification, NotificationKind } from "@/lib/api";
import { cn } from "@/lib/utils";

const notificationStyles: Record<
  NotificationKind,
  { icon: typeof Info; color: string; background: string }
> = {
  info: { icon: Info, color: "text-primary", background: "bg-primary/10" },
  success: {
    icon: CheckCircle2,
    color: "text-success",
    background: "bg-success/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    background: "bg-warning/10",
  },
  error: {
    icon: CircleAlert,
    color: "text-destructive",
    background: "bg-destructive/10",
  },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  const openNotification = async (notification: Notification) => {
    if (!notification.readAt) await markAsRead(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Abrir notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] overflow-hidden p-0 sm:max-h-[36rem]"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => void markAllAsRead()}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[calc(70vh-3.5rem)] overflow-y-auto p-1 sm:max-h-[32rem]">
          {isLoading ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Carregando notificações...
            </p>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">Tudo em dia</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Você não possui notificações.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const style =
                notificationStyles[notification.type] ??
                notificationStyles.info;
              const Icon = style.icon;
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "items-start gap-3 px-3 py-3 focus:bg-muted",
                    !notification.readAt && "bg-primary/[0.06]",
                  )}
                  onSelect={() => void openNotification(notification)}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      style.background,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", style.color)} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 text-sm font-medium leading-5">
                        {notification.title}
                      </span>
                      {!notification.readAt && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {notification.description}
                    </span>
                    <span className="mt-1.5 block text-[11px] text-muted-foreground">
                      {notification.module} ·{" "}
                      {formatDate(notification.createdAt)}
                    </span>
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
