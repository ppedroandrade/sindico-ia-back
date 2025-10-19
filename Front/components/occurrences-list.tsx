"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, MapPin, User, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function OccurrencesList() {
  const { toast } = useToast()
  const [selectedOccurrence, setSelectedOccurrence] = useState<number | null>(null)
  const occurrences = [
    {
      id: 1,
      title: "Elevador 2 com problema",
      description: "Elevador fazendo barulho estranho e parando entre andares",
      location: "Torre A - Elevador 2",
      reporter: "Apto 405 - João Silva",
      date: "2025-10-15",
      priority: "urgent",
      status: "open",
      category: "Manutenção",
    },
    {
      id: 2,
      title: "Vazamento no estacionamento",
      description: "Água vazando do teto na vaga 23",
      location: "Garagem - Subsolo 1",
      reporter: "Apto 301 - Roberto Lima",
      date: "2025-10-15",
      priority: "urgent",
      status: "in-progress",
      category: "Hidráulica",
    },
    {
      id: 3,
      title: "Lâmpada queimada no corredor",
      description: "Corredor do 5º andar sem iluminação",
      location: "Torre B - 5º andar",
      reporter: "Apto 502 - Ana Oliveira",
      date: "2025-10-14",
      priority: "normal",
      status: "in-progress",
      category: "Elétrica",
    },
    {
      id: 4,
      title: "Barulho excessivo",
      description: "Obra em horário não permitido",
      location: "Apto 308",
      reporter: "Apto 309 - Pedro Costa",
      date: "2025-10-14",
      priority: "normal",
      status: "open",
      category: "Convivência",
    },
    {
      id: 5,
      title: "Portão da garagem travando",
      description: "Portão não abre completamente",
      location: "Entrada principal",
      reporter: "Apto 102 - Lucas Martins",
      date: "2025-10-13",
      priority: "urgent",
      status: "in-progress",
      category: "Manutenção",
    },
  ]

  const priorityConfig = {
    urgent: { label: "Urgente", className: "bg-destructive/10 text-destructive border-destructive/20" },
    normal: { label: "Normal", className: "bg-primary/10 text-primary border-primary/20" },
    low: { label: "Baixa", className: "bg-muted text-muted-foreground border-border" },
  }

  const statusConfig = {
    open: { label: "Aberta", icon: AlertTriangle, color: "text-destructive" },
    "in-progress": { label: "Em Andamento", icon: Clock, color: "text-primary" },
    resolved: { label: "Resolvida", icon: CheckCircle, color: "text-accent" },
  }

  const handleViewDetails = (id: number) => {
    setSelectedOccurrence(id)
    toast({
      title: "Detalhes da ocorrência",
      description: `Visualizando ocorrência #${id}`,
    })
  }

  const handleUpdateStatus = (id: number) => {
    toast({
      title: "Status atualizado",
      description: "A ocorrência foi marcada como em andamento",
    })
  }

  const handleAssign = (id: number) => {
    toast({
      title: "Ocorrência atribuída",
      description: "Um técnico foi designado para resolver o problema",
    })
  }

  const handleNewOccurrence = () => {
    toast({
      title: "Nova ocorrência",
      description: "Abrindo formulário para registrar nova ocorrência",
    })
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold">Ocorrências Ativas</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Problemas reportados pelos moradores</p>
          </div>
          <Button size="sm" onClick={handleNewOccurrence} className="w-full sm:w-auto">
            Nova Ocorrência
          </Button>
        </div>

        <div className="space-y-3">
          {occurrences.map((occurrence) => {
            const StatusIcon = statusConfig[occurrence.status as keyof typeof statusConfig].icon

            return (
              <div
                key={occurrence.id}
                className="p-3 md:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex gap-3 flex-1">
                      <div
                        className={`h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center shrink-0 ${occurrence.priority === "urgent" ? "bg-destructive/10" : "bg-primary/10"}`}
                      >
                        <StatusIcon
                          className={`h-4 w-4 md:h-5 md:w-5 ${statusConfig[occurrence.status as keyof typeof statusConfig].color}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-xs md:text-sm">{occurrence.title}</p>
                          <Badge
                            variant="outline"
                            className={`${priorityConfig[occurrence.priority as keyof typeof priorityConfig].className} text-xs`}
                          >
                            {priorityConfig[occurrence.priority as keyof typeof priorityConfig].label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {occurrence.category}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{occurrence.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs text-muted-foreground pl-0 md:pl-13">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {occurrence.location}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {occurrence.reporter}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span>{new Date(occurrence.date).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 bg-transparent w-full sm:w-auto"
                      onClick={() => handleViewDetails(occurrence.id)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 bg-transparent w-full sm:w-auto"
                      onClick={() => handleUpdateStatus(occurrence.id)}
                    >
                      Atualizar Status
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 bg-transparent w-full sm:w-auto"
                      onClick={() => handleAssign(occurrence.id)}
                    >
                      Atribuir
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
