"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApiError, apiRequest, type Occurrence, type Reservation } from "@/lib/api"

type DashboardActivity = {
  recentReservations: Reservation[]
  recentOccurrences: Occurrence[]
}

type ActivityItem = {
  id: string
  title: string
  subtitle: string
  date: string
  type: "Reserva" | "Ocorrência"
}

export function RecentActivity() {
  const [activity, setActivity] = useState<DashboardActivity | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadActivity() {
      try {
        setActivity((await apiRequest("/dashboard/summary")) as DashboardActivity)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar atividades")
      }
    }

    loadActivity()
  }, [])

  const items = useMemo<ActivityItem[]>(() => {
    const reservations =
      activity?.recentReservations.map((reservation) => ({
        id: reservation.id,
        title: reservation.area?.name ?? "Reserva",
        subtitle: `${reservation.user?.name ?? "Morador"} - ${reservation.status}`,
        date: reservation.createdAt,
        type: "Reserva" as const,
      })) ?? []

    const occurrences =
      activity?.recentOccurrences.map((occurrence) => ({
        id: occurrence.id,
        title: occurrence.title,
        subtitle: `${occurrence.reporter?.name ?? "Morador"} - ${occurrence.status}`,
        date: occurrence.createdAt,
        type: "Ocorrência" as const,
      })) ?? []

    return [...reservations, ...occurrences]
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .slice(0, 6)
  }, [activity])

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">Atividade recente</h3>
        <p className="text-sm text-muted-foreground">Reservas e ocorrências registradas no sistema</p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
