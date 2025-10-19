"use client"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", receita: 45000, despesa: 32000 },
  { month: "Fev", receita: 48000, despesa: 35000 },
  { month: "Mar", receita: 46000, despesa: 33000 },
  { month: "Abr", receita: 49000, despesa: 36000 },
  { month: "Mai", receita: 47000, despesa: 34000 },
  { month: "Jun", receita: 50000, despesa: 37000 },
]

export function FinancialSummary() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
          <p className="text-sm text-muted-foreground">Receitas vs Despesas (últimos 6 meses)</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-xl font-bold text-primary">R$ 285.000</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesa Total</p>
            <p className="text-xl font-bold text-accent">R$ 207.000</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
