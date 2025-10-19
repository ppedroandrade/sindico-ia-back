"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReservationCalendar } from "@/components/reservation-calendar"
import { ReservationsList } from "@/components/reservations-list"
import { CommonAreas } from "@/components/common-areas"
import { ResidentReservations } from "@/components/resident-reservations"
import { useState, useEffect } from "react"

export type Reservation = {
  id: number
  area: string
  unit: string
  resident: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  guests: number
}

export default function ReservasPage() {
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      area: "Salão de Festas",
      unit: "Apto 205",
      resident: "Fernanda Souza",
      date: "2025-10-18",
      time: "19:00 - 23:00",
      status: "confirmed",
      guests: 60,
    },
    {
      id: 2,
      area: "Churrasqueira",
      unit: "Apto 301",
      resident: "Roberto Lima",
      date: "2025-10-20",
      time: "12:00 - 18:00",
      status: "confirmed",
      guests: 25,
    },
    {
      id: 3,
      area: "Salão de Festas",
      unit: "Apto 102",
      resident: "Lucas Martins",
      date: "2025-10-22",
      time: "18:00 - 23:00",
      status: "pending",
      guests: 70,
    },
    {
      id: 4,
      area: "Churrasqueira",
      unit: "Apto 405",
      resident: "João Silva",
      date: "2025-10-22",
      time: "11:00 - 16:00",
      status: "pending",
      guests: 20,
    },
    {
      id: 5,
      area: "Salão de Festas",
      unit: "Apto 308",
      resident: "Pedro Costa",
      date: "2025-10-25",
      time: "20:00 - 02:00",
      status: "confirmed",
      guests: 80,
    },
  ])

  const handleConfirm = (id: number) => {
    setReservations((prev) => prev.map((res) => (res.id === id ? { ...res, status: "confirmed" as const } : res)))
  }

  const handleCancel = (id: number) => {
    setReservations((prev) => prev.map((res) => (res.id === id ? { ...res, status: "cancelled" as const } : res)))
  }

  const handleEdit = (id: number, updatedData: Partial<Reservation>) => {
    setReservations((prev) => prev.map((res) => (res.id === id ? { ...res, ...updatedData } : res)))
  }

  const handleDelete = (id: number) => {
    setReservations((prev) => prev.filter((res) => res.id !== id))
  }

  const handleNewReservation = (newReservation: Omit<Reservation, "id">) => {
    const id = Math.max(...reservations.map((r) => r.id), 0) + 1
    setReservations((prev) => [...prev, { ...newReservation, id }])
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
              <CommonAreas />
            </div>
          </div>

          <ReservationsList
            reservations={reservations}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <ResidentReservations
          reservations={reservations}
          onNewReservation={handleNewReservation}
          onCancel={handleCancel}
        />
      )}
    </DashboardLayout>
  )
}
