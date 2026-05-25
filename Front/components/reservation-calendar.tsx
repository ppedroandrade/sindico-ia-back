"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { Reservation } from "@/app/reservas/page"

type ReservationCalendarProps = {
  reservations: Reservation[]
}

export function ReservationCalendar({ reservations }: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const reservationsByDay: Record<number, Reservation[]> = {}
  reservations
    .filter((r) => r.status !== "cancelled")
    .forEach((reservation) => {
      const reservationDate = new Date(reservation.date)
      if (
        reservationDate.getMonth() === currentDate.getMonth() &&
        reservationDate.getFullYear() === currentDate.getFullYear()
      ) {
        const day = reservationDate.getDate()
        if (!reservationsByDay[day]) {
          reservationsByDay[day] = []
        }
        reservationsByDay[day].push(reservation)
      }
    })

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base md:text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground p-1 md:p-2">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day[0]}</span>
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-1 md:p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const hasReservation = reservationsByDay[day]
            const today = new Date()
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear()

            return (
              <button
                key={day}
                className={`
                  p-1 md:p-2 rounded-lg text-xs md:text-sm font-medium transition-colors relative aspect-square
                  ${isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                  ${hasReservation && !isToday ? "bg-accent/10 text-accent" : ""}
                `}
              >
                {day}
                {hasReservation && (
                  <div className="absolute bottom-0.5 md:bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {hasReservation.map((_, idx) => (
                      <div key={idx} className="h-0.5 w-0.5 md:h-1 md:w-1 rounded-full bg-current" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-muted-foreground">Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-accent/10 border border-accent" />
              <span className="text-muted-foreground">Com reservas</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
