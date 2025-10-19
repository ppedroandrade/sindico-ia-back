import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "payment",
      title: "Pagamento recebido - Apto 301",
      description: "Condomínio + Fundo de Reserva",
      time: "Há 15 minutos",
      status: "success",
    },
    {
      id: 2,
      type: "reservation",
      title: "Nova reserva - Salão de Festas",
      description: "Apto 205 - 25/10/2025",
      time: "Há 1 hora",
      status: "info",
    },
    {
      id: 3,
      type: "occurrence",
      title: "Ocorrência reportada - Elevador 2",
      description: "Manutenção necessária",
      time: "Há 2 horas",
      status: "warning",
    },
    {
      id: 4,
      type: "chat",
      title: "Mensagem via chatbot",
      description: "Dúvida sobre boleto - Apto 102",
      time: "Há 3 horas",
      status: "info",
    },
    {
      id: 5,
      type: "payment",
      title: "Lembrete de inadimplência enviado",
      description: "11 unidades notificadas",
      time: "Há 5 horas",
      status: "warning",
    },
  ]

  const statusColors = {
    success: "bg-accent/10 text-accent border-accent/20",
    info: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Atividades Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas atualizações do sistema</p>
        </div>

        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{activity.title}</p>
                  <Badge
                    variant="outline"
                    className={`${statusColors[activity.status as keyof typeof statusColors]} text-xs shrink-0`}
                  >
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
