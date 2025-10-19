import { Card } from "@/components/ui/card"
import { MessageSquare, Users, CheckCircle, Clock } from "lucide-react"

export function ChatbotStats() {
  const stats = [
    {
      title: "Conversas Totais",
      value: "1,247",
      description: "Este mês",
      icon: MessageSquare,
      trend: "+18.2%",
      trendUp: true,
    },
    {
      title: "Usuários Ativos",
      value: "89",
      description: "Últimos 7 dias",
      icon: Users,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Taxa de Resolução",
      value: "94.3%",
      description: "Sem intervenção humana",
      icon: CheckCircle,
      trend: "+3.1%",
      trendUp: true,
    },
    {
      title: "Tempo Médio",
      value: "2.4 min",
      description: "Por conversa",
      icon: Clock,
      trend: "-0.8 min",
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className={`text-xs ${stat.trendUp ? "text-accent" : "text-destructive"}`}>{stat.trend}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
