import { Card } from "@/components/ui/card"
import { Users, DollarSign, Calendar, AlertTriangle } from "lucide-react"

export function OverviewStats() {
  const stats = [
    {
      title: "Total de Unidades",
      value: "124",
      description: "120 ocupadas, 4 vagas",
      icon: Users,
      trend: "+2 este mês",
      trendUp: true,
    },
    {
      title: "Taxa de Inadimplência",
      value: "8.5%",
      description: "11 unidades em atraso",
      icon: DollarSign,
      trend: "-1.2% vs mês anterior",
      trendUp: true,
    },
    {
      title: "Reservas Ativas",
      value: "23",
      description: "Próximos 30 dias",
      icon: Calendar,
      trend: "+5 esta semana",
      trendUp: true,
    },
    {
      title: "Ocorrências Abertas",
      value: "7",
      description: "3 urgentes, 4 normais",
      icon: AlertTriangle,
      trend: "-2 vs semana anterior",
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-xl md:text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{stat.description}</p>
                <p className={`text-xs mt-2 ${stat.trendUp ? "text-accent" : "text-destructive"}`}>{stat.trend}</p>
              </div>
              <div className="self-end md:self-auto md:ml-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
