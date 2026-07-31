"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import type { Reservation } from "@/lib/api"
import { getMonthLabel, getWeekdayLabels } from "@/lib/date"
import { cn } from "@/lib/utils"

type ReservationCalendarProps = {
  reservations: Reservation[]
}

const statusDotClass: Record<string, string> = {
  confirmed: "bg-success",
  pending: "bg-warning",
  completed: "bg-muted-foreground",
}

const statusBadgeVariant: Record<string, "success" | "warning" | "secondary"> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
}

const statusLabel: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  completed: "Concluída",
}

export function ReservationCalendar({ reservations }: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const reservationsByDay = useMemo(() => {
    const byDay: Record<number, Reservation[]> = {}
    reservations
      .filter((r) => r.status !== "cancelled")
      .forEach((reservation) => {
        const reservationDate = new Date(reservation.date)
        if (
          reservationDate.getMonth() === currentDate.getMonth() &&
          reservationDate.getFullYear() === currentDate.getFullYear()
        ) {
          const day = reservationDate.getDate()
          byDay[day] ??= []
          byDay[day].push(reservation)
        }
      })
    return byDay
  }, [reservations, currentDate])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const today = new Date()

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base md:text-lg font-semibold">
            {getMonthLabel(currentDate.getMonth())} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <Button size="icon-sm" variant="outline" onClick={previousMonth} aria-label="Mês anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button size="icon-sm" variant="outline" onClick={nextMonth} aria-label="Próximo mês">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {getWeekdayLabels().map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs md:text-sm font-medium text-muted-foreground p-1 md:p-2",
                (index === 0 || index === 6) && "text-muted-foreground/60",
              )}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day[0]}</span>
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-1 md:p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayReservations = reservationsByDay[day]
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear()
            const isWeekend = (firstDayOfMonth + i) % 7 === 0 || (firstDayOfMonth + i) % 7 === 6

            const cell = (
              <button
                type="button"
                className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg text-xs md:text-sm font-medium transition-colors relative",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : dayReservations
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : isWeekend
                        ? "text-muted-foreground/70 hover:bg-muted"
                        : "hover:bg-muted",
                )}
              >
                {day}
                {dayReservations && (
                  <div className="flex gap-0.5">
                    {dayReservations.slice(0, 3).map((reservation) => (
                      <div
                        key={reservation.id}
                        className={cn("h-1 w-1 md:h-1.5 md:w-1.5 rounded-full", statusDotClass[reservation.status] ?? "bg-current")}
                      />
                    ))}
                  </div>
                )}
              </button>
            )

            if (!dayReservations) {
              return <div key={day}>{cell}</div>
            }

            return (
              <Popover key={day}>
                <PopoverTrigger asChild>{cell}</PopoverTrigger>
                <PopoverContent className="w-72" align="center">
                  <p className="mb-3 text-sm font-semibold">
                    {day} de {getMonthLabel(currentDate.getMonth())}
                  </p>
                  <div className="space-y-3">
                    {dayReservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{reservation.area.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reservation.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} –{" "}
                            {new Date(reservation.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <Badge variant={statusBadgeVariant[reservation.status] ?? "outline"} className="shrink-0 text-[10px]">
                          {statusLabel[reservation.status] ?? reservation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            <span className="text-muted-foreground">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Pendente</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
