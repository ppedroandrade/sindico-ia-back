"use client"

import type React from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { AuthCheck } from "./auth-check"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthCheck>
      <div className="min-h-screen">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 md:p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </AuthCheck>
  )
}
