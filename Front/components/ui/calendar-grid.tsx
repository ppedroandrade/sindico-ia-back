"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getMonthLabel, getWeekdayLabels } from "@/lib/date"

type CalendarGridProps = {
  /** Selected date as "YYYY-MM-DD", or empty for none. */
  value?: string
  onSelect: (value: string) => void
  /** Minimum selectable date as "YYYY-MM-DD". Days before it are disabled. */
  minDate?: string
  className?: string
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function CalendarGrid({ value, onSelect, minDate, className }: CalendarGridProps) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined
  const [viewDate, setViewDate] = React.useState(() => selectedDate ?? new Date())

  const today = new Date()
  const todayKey = toDateKey(today)
  const minKey = minDate

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<{ key: string; day: number } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: toDateKey(new Date(year, month, day)), day })
  }

  return (
    <div className={cn("w-72", className)}>
      <div className="flex items-center justify-between pb-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-sm font-medium">
          {getMonthLabel(month)} {year}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {getWeekdayLabels().map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} />
          const isSelected = cell.key === value
          const isToday = cell.key === todayKey
          const isDisabled = minKey ? cell.key < minKey : false

          return (
            <button
              key={cell.key}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(cell.key)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                "hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                !isSelected && isToday && "border border-primary/50 font-semibold text-primary",
              )}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
