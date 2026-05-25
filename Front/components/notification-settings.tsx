"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
  const notifications = [
    {
      id: "payment-received",
      title: "Pagamentos Recebidos",
      description: "Notificar quando um pagamento for confirmado",
      enabled: false,
    },
    {
      id: "new-occurrence",
      title: "Novas Ocorrências",
      description: "Alertar sobre problemas reportados pelos moradores",
      enabled: false,
    },
    {
      id: "reservation-pending",
      title: "Reservas Pendentes",
      description: "Notificar sobre reservas aguardando aprovação",
      enabled: false,
    },
    {
      id: "overdue-payment",
      title: "Inadimplência",
      description: "Alertar sobre pagamentos em atraso",
      enabled: false,
    },
    {
      id: "chatbot-escalation",
      title: "Escalação do Chatbot",
      description: "Notificar quando o chatbot não conseguir resolver uma questão",
      enabled: false,
    },
    {
      id: "daily-summary",
      title: "Resumo Diário",
      description: "Receber relatório diário das atividades",
      enabled: false,
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Notificações</h3>
          <p className="text-sm text-muted-foreground">Configure os alertas que deseja receber</p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border">
              <div className="flex-1">
                <Label htmlFor={notification.id} className="text-sm font-medium cursor-pointer">
                  {notification.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
              </div>
              <Switch id={notification.id} defaultChecked={notification.enabled} disabled />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
