"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, Calendar, AlertTriangle, Info, Search } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "urgent" | "event"
  date: Date
  author: string
}

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Assembleia Geral Ordinária",
    content:
      "Convocamos todos os condôminos para a Assembleia Geral Ordinária que será realizada no dia 15/02/2025 às 19h no salão de festas. Pauta: aprovação de contas, eleição do síndico e discussão sobre obras.",
    type: "event",
    date: new Date("2025-02-15"),
    author: "Administração",
  },
  {
    id: "2",
    title: "Manutenção dos Elevadores",
    content:
      "Informamos que nos dias 20 e 21/01/2025 será realizada manutenção preventiva nos elevadores. O serviço será das 8h às 17h. Pedimos a compreensão de todos.",
    type: "warning",
    date: new Date("2025-01-20"),
    author: "Síndico",
  },
  {
    id: "3",
    title: "Novo Horário da Piscina",
    content:
      "A partir de 01/02/2025, o horário de funcionamento da piscina será das 7h às 22h. Lembramos que é obrigatório o uso de touca.",
    type: "info",
    date: new Date("2025-02-01"),
    author: "Administração",
  },
]

export function ResidentAnnouncements() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAnnouncements = announcements.filter(
    (ann) =>
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: Announcement["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <Bell className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: Announcement["type"]) => {
    const variants = {
      urgent: "destructive",
      warning: "default",
      event: "secondary",
      info: "outline",
    } as const

    const labels = {
      urgent: "Urgente",
      warning: "Atenção",
      event: "Evento",
      info: "Informação",
    }

    return (
      <Badge variant={variants[type]} className="gap-1">
        {getTypeIcon(type)}
        {labels[type]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Avisos e Comunicados</h1>
        <p className="text-sm md:text-base text-muted-foreground">Fique por dentro das novidades do condomínio</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar avisos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">Nenhum aviso encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="p-4 md:p-6">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <CardTitle className="text-base md:text-lg">{announcement.title}</CardTitle>
                    {getTypeBadge(announcement.type)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                    <span>Por {announcement.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      {announcement.date.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-xs md:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
