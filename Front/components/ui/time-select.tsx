"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateTimeOptions } from "@/lib/date"

type TimeSelectProps = {
  /** Value as "HH:mm", or empty for none. */
  value?: string
  onChange: (value: string) => void
  stepMinutes?: number
  placeholder?: string
  id?: string
}

export function TimeSelect({ value, onChange, stepMinutes = 30, placeholder = "Selecione o horário", id }: TimeSelectProps) {
  const options = generateTimeOptions(stepMinutes)

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
