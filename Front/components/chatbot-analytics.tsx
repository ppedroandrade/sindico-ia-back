"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const topicsData = [
  { topic: "Boletos", count: 145 },
  { topic: "Reservas", count: 98 },
  { topic: "Ocorrências", count: 76 },
  { topic: "Assembleia", count: 54 },
  { topic: "Regras", count: 42 },
]

export function ChatbotAnalytics() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tópicos Mais Consultados</h3>
          <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicsData} layout="vertical">
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="topic" type="category" className="text-xs" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div>
            <p className="text-sm font-medium">Satisfação dos Usuários</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "94.3%" }} />
              </div>
              <span className="text-sm font-semibold text-accent">94.3%</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Horário de Pico</p>
            <p className="text-sm text-muted-foreground mt-1">18h - 21h (horário comercial)</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
