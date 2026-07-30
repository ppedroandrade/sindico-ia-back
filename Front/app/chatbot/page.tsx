"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatbotStats } from "@/components/chatbot-stats"
import { ChatbotAnalytics } from "@/components/chatbot-analytics"
import { ResidentChat } from "@/components/resident-chat"
import { AdminConversations } from "@/components/admin-conversations"
import { useCurrentUser } from "@/components/auth-context"

export default function ChatbotPage() {
  const currentUser = useCurrentUser()

  if (currentUser?.role !== "admin") {
    return (
      <DashboardLayout>
        <ResidentChat />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot / IA</h1>
          <p className="text-muted-foreground">Gerencie conversas e responda aos moradores</p>
        </div>

        <ChatbotStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdminConversations />
          </div>
          <div>
            <ChatbotAnalytics />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
