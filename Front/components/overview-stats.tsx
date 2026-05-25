"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Bell, Building2, Calendar, Users } from "lucide-react"
import { apiRequest } from "@/lib/api"

type DashboardSummary = {
  stats: {
    residents: number
    commonAreas: number
    pendingReservations: number
    openOccurrences: number
    announcements: number
  }
}

export function OverviewStats() {
  const [stats, setStats] = useState<DashboardSummary["stats"]>({
    residents: 0,
    commonAreas: 0,
    pendingReservations: 0,
    openOccurrences: 0,
    announcements: 0,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const summary = (await apiRequest("/dashboard/summary")) as DashboardSummary
        setStats(summary.stats)
      } catch {
        setStats({
          residents: 0,
          commonAreas: 0,
          pendingReservations: 0,
          openOccurrences: 0,
          announcements: 0,
        })
      }
    }

    loadStats()
  }, [])

  const items = [
    { title: "Moradores", value: stats.residents, icon: Users },
    { title: "Áreas comuns", value: stats.commonAreas, icon: Building2 },
    { title: "Reservas pendentes", value: stats.pendingReservations, icon: Calendar },
    { title: "Ocorrências abertas", value: stats.openOccurrences, icon: AlertTriangle },
    { title: "Avisos publicados", value: stats.announcements, icon: Bell },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title} className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
