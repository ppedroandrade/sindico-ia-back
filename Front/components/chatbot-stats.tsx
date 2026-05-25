"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { apiRequest, type AiConversation } from "@/lib/api"
import { CheckCircle, Clock, MessageSquare, Users } from "lucide-react"

export function ChatbotStats() {
  const [conversations, setConversations] = useState<AiConversation[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        setConversations((await apiRequest("/ai/conversations")) as AiConversation[])
      } catch {
        setConversations([])
      }
    }

    loadStats()
  }, [])

  const stats = useMemo(() => {
    const residentIds = new Set(conversations.map((conversation) => conversation.userId))
    const messages = conversations.reduce((count, conversation) => count + conversation.messages.length, 0)

    return [
      { title: "Conversas", value: String(conversations.length), icon: MessageSquare },
      { title: "Moradores", value: String(residentIds.size), icon: Users },
      { title: "Mensagens", value: String(messages), icon: CheckCircle },
      { title: "IA ativa", value: "Não", icon: Clock },
    ]
  }, [conversations])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
