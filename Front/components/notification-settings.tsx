"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function NotificationSettings() {
  const notifications = [
    {
      id: "payment-received",
      title: "Pagamentos Recebidos",
      description: "Notificar quando um pagamento for confirmado",
    },
    {
      id: "new-occurrence",
      title: "Novas Ocorrências",
      description: "Alertar sobre problemas reportados pelos moradores",
    },
    {
      id: "reservation-pending",
      title: "Reservas Pendentes",
      description: "Notificar sobre reservas aguardando aprovação",
    },
    {
      id: "overdue-payment",
      title: "Inadimplência",
      description: "Alertar sobre pagamentos em atraso",
    },
    {
      id: "chatbot-escalation",
      title: "Escalação do Chatbot",
      description:
        "Notificar quando o chatbot não conseguir resolver uma questão",
    },
    {
      id: "operational-updates",
      title: "Atualizações Operacionais",
      description:
        "Alertar sobre portaria, manutenção, avisos e cadastros relevantes",
    },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Notificações</h3>
          <p className="text-sm text-muted-foreground">
            Alertas operacionais ativos para o perfil administrador
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between gap-4 p-4 rounded-lg border"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-success/30 bg-success/10 text-success"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
