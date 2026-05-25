import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function OccurrencesStats() {
  const stats = [
    { title: "Abertas", value: "0", icon: AlertTriangle },
    { title: "Em andamento", value: "0", icon: Clock },
    { title: "Resolvidas", value: "0", icon: CheckCircle },
    { title: "Tempo médio", value: "-", icon: Clock },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
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
