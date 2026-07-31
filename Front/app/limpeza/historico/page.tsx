"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EmptyState } from "@/components/empty-state"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApiError, apiRequest, type Reservation } from "@/lib/api"
import { CheckCircle2, MapPin, TriangleAlert } from "lucide-react"

export default function HistoricoPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        setReservations((await apiRequest("/reservations")) as Reservation[])
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar o histórico")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const cleaned = reservations
    .filter((r) => r.cleaningStatus === "cleaned")
    .sort((a, b) => new Date(b.cleanedAt ?? b.updatedAt ?? 0).getTime() - new Date(a.cleanedAt ?? a.updatedAt ?? 0).getTime())

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Histórico de Limpezas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Áreas já limpas e conferidas</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : error ? (
          <Card className="p-6 text-sm text-destructive">{error}</Card>
        ) : cleaned.length === 0 ? (
          <EmptyState title="Nenhuma limpeza registrada" description="As limpezas concluídas aparecerão aqui." />
        ) : (
          <div className="space-y-3">
            {cleaned.map((reservation) => (
              <Card key={reservation.id} className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 shrink-0">
                      <MapPin className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{reservation.area.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Limpo por {reservation.cleanedBy?.name ?? "-"} em{" "}
                        {reservation.cleanedAt ? new Date(reservation.cleanedAt).toLocaleString("pt-BR") : "-"}
                      </p>
                      {reservation.cleaningNotes && (
                        <p className="text-xs text-muted-foreground mt-1">"{reservation.cleaningNotes}"</p>
                      )}
                    </div>
                  </div>
                  {reservation.itemsVerified ? (
                    <Badge variant="success" className="gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Itens conferidos
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1 shrink-0">
                      <TriangleAlert className="h-3 w-3" />
                      Itens não conferidos
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
