"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ApiError, apiRequest } from "@/lib/api"

type FinancialDashboard = {
  financial: {
    paidTotal: number
    pendingTotal: number
    paidCount: number
    pendingCount: number
    overdueCount: number
  }
}

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function FinancialSummary() {
  const [data, setData] = useState<FinancialDashboard["financial"] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFinancialSummary() {
      try {
        const summary = (await apiRequest("/dashboard/summary")) as FinancialDashboard
        setData(summary.financial)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar o resumo financeiro")
      }
    }

    loadFinancialSummary()
  }, [])

  const paidTotal = data?.paidTotal ?? 0
  const pendingTotal = data?.pendingTotal ?? 0
  const total = paidTotal + pendingTotal
  const receivedRate = total > 0 ? Math.round((paidTotal / total) * 100) : 0

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">Resumo financeiro</h3>
        <p className="text-sm text-muted-foreground">Baseado nas cobranças reais cadastradas</p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="mt-2 text-2xl font-semibold">{currency(paidTotal)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="mt-2 text-2xl font-semibold">{currency(pendingTotal)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de recebimento</span>
              <span className="font-medium">{receivedRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${receivedRate}%` }} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Pagas</p>
              <p className="text-lg font-semibold">{data?.paidCount ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-lg font-semibold">{data?.pendingCount ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vencidas</p>
              <p className="text-lg font-semibold">{data?.overdueCount ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
