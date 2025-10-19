"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const expenseData = [
  { name: "Manutenção", value: 15000, color: "hsl(var(--chart-1))" },
  { name: "Limpeza", value: 8000, color: "hsl(var(--chart-2))" },
  { name: "Segurança", value: 12000, color: "hsl(var(--chart-3))" },
  { name: "Água/Luz", value: 6000, color: "hsl(var(--chart-4))" },
  { name: "Outros", value: 4000, color: "hsl(var(--chart-5))" },
]

export function FinancialCharts() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Distribuição de Despesas</h3>
          <p className="text-sm text-muted-foreground">Categorias de gastos do mês atual</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          {expenseData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <p className="text-sm font-semibold">R$ {item.value.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
