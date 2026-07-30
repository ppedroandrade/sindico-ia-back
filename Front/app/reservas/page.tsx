"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReservationCalendar } from "@/components/reservation-calendar"
import { ReservationsList } from "@/components/reservations-list"
import { CommonAreas } from "@/components/common-areas"
import { ResidentReservations } from "@/components/resident-reservations"
import { useEffect, useState } from "react"
import { ApiError, apiRequest, type CommonArea, type Reservation, type ReservationStatus } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/components/auth-context"

export type { Reservation } from "@/lib/api"

export default function ReservasPage() {
  const currentUser = useCurrentUser()
  const userRole = currentUser?.role ?? ""
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [areas, setAreas] = useState<CommonArea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    setError(null)
    try {
      const [reservationsResponse, areasResponse] = await Promise.all([
        apiRequest("/reservations"),
        apiRequest("/common-areas"),
      ])
      setReservations(reservationsResponse as Reservation[])
      setAreas(areasResponse as CommonArea[])
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Não foi possível carregar as reservas"
      setError(message)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(true)
    const interval = window.setInterval(() => loadData(false), 5000)
    return () => window.clearInterval(interval)
  }, [])

  const updateReservation = async (id: string, data: Partial<Reservation> & { status?: ReservationStatus }) => {
    const payload = {
      areaId: data.areaId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      guests: data.guests,
      observations: data.observations,
      status: data.status,
    }
    const updated = (await apiRequest(`/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })) as Reservation
    setReservations((prev) => prev.map((reservation) => (reservation.id === id ? updated : reservation)))
  }

  const handleConfirm = async (id: string) => updateReservation(id, { status: "confirmed" })

  const handleCancel = async (id: string) => {
    const updated = (await apiRequest(`/reservations/${id}/cancel`, {
      method: "PATCH",
    })) as Reservation
    setReservations((prev) => prev.map((reservation) => (reservation.id === id ? updated : reservation)))
  }

  const handleEdit = async (id: string, updatedData: Partial<Reservation>) => updateReservation(id, updatedData)

  const handleDelete = async (id: string) => {
    await apiRequest(`/reservations/${id}`, { method: "DELETE" })
    setReservations((prev) => prev.filter((reservation) => reservation.id !== id))
  }

  const handleNewReservation = async (payload: {
    areaId: string
    date: string
    startTime: string
    endTime: string
    guests: number
    observations?: string
  }) => {
    const created = (await apiRequest("/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    })) as Reservation
    setReservations((prev) => [created, ...prev])
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Card className="p-6">Carregando reservas...</Card>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="space-y-4 p-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={() => loadData(true)}>Tentar novamente</Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {userRole === "admin" ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
            <p className="text-muted-foreground">Gestão de reservas de áreas comuns</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ReservationCalendar reservations={reservations} />
            </div>
            <div>
              <CommonAreas areas={areas} />
            </div>
          </div>

          <ReservationsList
            reservations={reservations}
            areas={areas}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <ResidentReservations
          reservations={reservations}
          areas={areas}
          onNewReservation={handleNewReservation}
          onCancel={async (id) => {
            await handleCancel(id)
            toast({ title: "Reserva cancelada", description: "Sua reserva foi cancelada com sucesso." })
          }}
        />
      )}
    </DashboardLayout>
  )
}
