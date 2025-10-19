import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

export function PaymentOverview() {
  const metrics = [
    {
      title: "Receita Mensal",
      value: "R$ 50.240,00",
      change: "+4.2%",
      trend: "up",
      icon: DollarSign,
      description: "vs mês anterior",
    },
    {
      title: "Taxa de Recebimento",
      value: "91.5%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      description: "120 de 124 unidades",
    },
    {
      title: "Inadimplência",
      value: "R$ 4.280,00",
      change: "-8.3%",
      trend: "up",
      icon: TrendingDown,
      description: "11 unidades em atraso",
    },
    {
      title: "Atrasos > 30 dias",
      value: "4",
      change: "-1",
      trend: "up",
      icon: AlertCircle,
      description: "Requer atenção",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const isPositive = metric.trend === "up"

        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.description}</span>
                </div>
              </div>
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${isPositive ? "bg-accent/10" : "bg-destructive/10"}`}
              >
                <Icon className={`h-6 w-6 ${isPositive ? "text-accent" : "text-destructive"}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
