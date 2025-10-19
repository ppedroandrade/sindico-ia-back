"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CommonAreas() {
  const areas = [
    {
      id: 1,
      name: "Salão de Festas",
      capacity: "80 pessoas",
      price: "R$ 200,00",
      available: true,
      reservations: 12,
    },
    {
      id: 2,
      name: "Churrasqueira",
      capacity: "30 pessoas",
      price: "R$ 100,00",
      available: true,
      reservations: 8,
    },
    {
      id: 3,
      name: "Quadra Esportiva",
      capacity: "20 pessoas",
      price: "Gratuito",
      available: true,
      reservations: 15,
    },
    {
      id: 4,
      name: "Piscina",
      capacity: "40 pessoas",
      price: "Gratuito",
      available: false,
      reservations: 0,
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Áreas Comuns</h3>
            <p className="text-sm text-muted-foreground">Espaços disponíveis</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova
          </Button>
        </div>

        <div className="space-y-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className={`p-4 rounded-lg border ${area.available ? "bg-card hover:bg-muted/50" : "bg-muted/30 opacity-60"} transition-colors`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{area.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{area.capacity}</p>
                  </div>
                  {!area.available && (
                    <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">Indisponível</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-semibold text-primary">{area.price}</span>
                  <span className="text-xs text-muted-foreground">{area.reservations} reservas/mês</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
