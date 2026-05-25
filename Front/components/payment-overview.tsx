import { Card } from "@/components/ui/card"
import { AlertCircle, DollarSign, TrendingDown, TrendingUp } from "lucide-react"

export function PaymentOverview() {
  const metrics = [
    { title: "Receita Mensal", value: "R$ 0,00", icon: DollarSign },
    { title: "Taxa de Recebimento", value: "0%", icon: TrendingUp },
    { title: "Inadimplência", value: "R$ 0,00", icon: TrendingDown },
    { title: "Atrasos > 30 dias", value: "0", icon: AlertCircle },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
