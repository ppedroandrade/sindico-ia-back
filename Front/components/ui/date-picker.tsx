"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  /** Value as "YYYY-MM-DD", or empty for none. */
  value?: string
  onChange: (value: string) => void
  minDate?: string
  placeholder?: string
  className?: string
  id?: string
}

export function DatePicker({ value, onChange, minDate, placeholder = "Selecione uma data", className, id }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const label = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="size-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <CalendarGrid
          value={value}
          minDate={minDate}
          onSelect={(next) => {
            onChange(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
