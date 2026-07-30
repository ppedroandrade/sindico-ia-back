"use client"

import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import type { CommonArea } from "@/lib/api"
import { formatCurrency } from "@/lib/format"

export function CommonAreas({ areas }: { areas: CommonArea[] }) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Áreas Comuns</h3>
            <p className="text-sm text-muted-foreground">Espaços disponíveis</p>
          </div>
        </div>

        <div className="space-y-3">
          {areas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma área cadastrada.</p>}
          {areas.map((area) => (
            <div
              key={area.id}
              className={`p-4 rounded-lg border ${area.available ? "bg-card hover:bg-muted/50" : "bg-muted/30 opacity-60"} transition-colors`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {area.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{area.capacity} pessoas</p>
                  </div>
                  {!area.available && (
                    <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">Indisponível</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-semibold text-primary">{formatCurrency(area.pricePerHour)}/h</span>
                  <span className="text-xs text-muted-foreground">{area.reservations?.length ?? 0} reservas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
