"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { formatCurrency } from "@/lib/format"

export default function RelatoriosPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [financial, setFinancial] = useState<any>(null)
  const [occurrences, setOccurrences] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  useEffect(() => {
    async function loadReports() {
      const [dashboardData, financialData, occurrencesData, reservationsData] = await Promise.all([
        apiRequest("/dashboard/summary"),
        apiRequest("/payments/report"),
        apiRequest("/occurrences"),
        apiRequest("/reservations"),
      ])
      setDashboard(dashboardData)
      setFinancial(financialData)
      setOccurrences(occurrencesData as any[])
      setReservations(reservationsData as any[])
    }
    loadReports().catch(() => undefined)
  }, [])

  const occurrencesByStatus = occurrences.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1
    return acc
  }, {})

  const reservationsByStatus = reservations.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm md:text-base text-muted-foreground">Indicadores reais do banco de dados</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(dashboard?.stats ?? {}).map(([key, value]) => (
            <Card key={key} className="p-4">
              <p className="text-xs text-muted-foreground">{key}</p>
              <p className="mt-2 text-2xl font-semibold">{String(value)}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Financeiro</h2>
            {Object.entries(financial?.summary ?? {}).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b py-2 text-sm last:border-0">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{formatCurrency(Number(value))}</span>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Ocorrências</h2>
            {Object.entries(occurrencesByStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b py-2 text-sm last:border-0">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Reservas</h2>
            {Object.entries(reservationsByStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b py-2 text-sm last:border-0">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
