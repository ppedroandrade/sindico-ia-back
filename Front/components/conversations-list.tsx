"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, Clock, Eye } from "lucide-react"

export function ConversationsList() {
  const conversations = [
    {
      id: 1,
      user: "Apto 301 - Roberto Lima",
      topic: "Dúvida sobre boleto",
      messages: 8,
      resolved: true,
      date: "2025-10-16 14:32",
      duration: "3 min",
      category: "Financeiro",
    },
    {
      id: 2,
      user: "Apto 205 - Fernanda Souza",
      topic: "Reserva de salão de festas",
      messages: 12,
      resolved: true,
      date: "2025-10-16 11:15",
      duration: "5 min",
      category: "Reservas",
    },
    {
      id: 3,
      user: "Apto 102 - Lucas Martins",
      topic: "Reportar problema no elevador",
      messages: 6,
      resolved: false,
      date: "2025-10-16 09:45",
      duration: "2 min",
      category: "Ocorrências",
    },
    {
      id: 4,
      user: "Apto 405 - João Silva",
      topic: "Informações sobre assembleia",
      messages: 15,
      resolved: true,
      date: "2025-10-15 16:20",
      duration: "4 min",
      category: "Geral",
    },
    {
      id: 5,
      user: "Apto 308 - Pedro Costa",
      topic: "Consulta de inadimplência",
      messages: 10,
      resolved: true,
      date: "2025-10-15 13:50",
      duration: "3 min",
      category: "Financeiro",
    },
    {
      id: 6,
      user: "Apto 502 - Ana Oliveira",
      topic: "Horário de funcionamento da piscina",
      messages: 4,
      resolved: true,
      date: "2025-10-15 10:30",
      duration: "1 min",
      category: "Geral",
    },
  ]

  const categoryColors = {
    Financeiro: "bg-primary/10 text-primary border-primary/20",
    Reservas: "bg-accent/10 text-accent border-accent/20",
    Ocorrências: "bg-destructive/10 text-destructive border-destructive/20",
    Geral: "bg-muted text-muted-foreground border-border",
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Conversas Recentes</h3>
            <p className="text-sm text-muted-foreground">Histórico de interações com o chatbot</p>
          </div>
          <Button size="sm" variant="outline">
            Ver Todas
          </Button>
        </div>

        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{conversation.topic}</p>
                        <Badge
                          variant="outline"
                          className={
                            categoryColors[conversation.category as keyof typeof categoryColors] || categoryColors.Geral
                          }
                        >
                          {conversation.category}
                        </Badge>
                        {conversation.resolved && (
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            Resolvida
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {conversation.user}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pl-13">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {conversation.messages} mensagens
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {conversation.duration}
                    </span>
                    <span>{conversation.date}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Conversa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
