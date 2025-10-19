"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, AlertCircle, DollarSign } from "lucide-react"

interface CleaningHistory {
  id: string
  area: string
  date: string
  status: "completed" | "pending"
  pendencies: number
  cost: number
  cleaner: string
}

export default function HistoricoPage() {
  const history: CleaningHistory[] = [
    {
      id: "1",
      area: "Salão de Festas",
      date: "17/10/2025",
      status: "pending",
      pendencies: 2,
      cost: 420,
      cleaner: "Maria Santos",
    },
    {
      id: "2",
      area: "Churrasqueira",
      date: "17/10/2025",
      status: "completed",
      pendencies: 0,
      cost: 0,
      cleaner: "Maria Santos",
    },
    {
      id: "3",
      area: "Playground",
      date: "16/10/2025",
      status: "completed",
      pendencies: 0,
      cost: 0,
      cleaner: "Maria Santos",
    },
    {
      id: "4",
      area: "Piscina",
      date: "15/10/2025",
      status: "completed",
      pendencies: 1,
      cost: 350,
      cleaner: "Maria Santos",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Histórico de Limpezas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Suas limpezas anteriores</p>
        </div>

        <div className="grid gap-4">
          {history.map((item) => (
            <Card key={item.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-base sm:text-lg">{item.area}</h3>
                    <Badge variant={item.status === "completed" ? "default" : "destructive"} className="text-xs">
                      {item.status === "completed" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Concluído
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {item.date}
                    </div>
                    {item.pendencies > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        {item.pendencies} pendência(s)
                      </div>
                    )}
                    {item.cost > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        R$ {item.cost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
