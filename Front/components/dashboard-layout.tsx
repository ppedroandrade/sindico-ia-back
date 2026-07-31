"use client";

import type React from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { AuthCheck } from "./auth-check";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { NotificationProvider } from "@/components/notification-context";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthCheck>
      <NotificationProvider>
        <div className="min-h-screen">
          <DashboardSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
          />
          <div className={sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}>
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-4 md:p-6">{children}</main>
          </div>
          <Toaster />
        </div>
      </NotificationProvider>
    </AuthCheck>
  );
}
