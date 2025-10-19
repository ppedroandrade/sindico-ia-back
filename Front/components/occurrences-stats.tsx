import { Card } from "@/components/ui/card"
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"

export function OccurrencesStats() {
  const stats = [
    {
      title: "Abertas",
      value: "7",
      description: "Aguardando resolução",
      icon: AlertTriangle,
      color: "destructive",
    },
    {
      title: "Em Andamento",
      value: "12",
      description: "Sendo tratadas",
      icon: Clock,
      color: "primary",
    },
    {
      title: "Resolvidas (mês)",
      value: "45",
      description: "Concluídas em outubro",
      icon: CheckCircle,
      color: "accent",
    },
    {
      title: "Tempo Médio",
      value: "2.3 dias",
      description: "Para resolução",
      icon: Clock,
      color: "primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const colorClasses = {
          destructive: "bg-destructive/10 text-destructive",
          primary: "bg-primary/10 text-primary",
          accent: "bg-accent/10 text-accent",
        }

        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
