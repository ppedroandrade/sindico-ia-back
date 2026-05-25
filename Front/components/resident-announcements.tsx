"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, Calendar, AlertTriangle, Info, Search } from "lucide-react"
import { ApiError, apiRequest, type Announcement, type AnnouncementType } from "@/lib/api"

export function ResidentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        setAnnouncements((await apiRequest("/announcements")) as Announcement[])
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar os avisos")
      } finally {
        setIsLoading(false)
      }
    }

    loadAnnouncements()
  }, [])

  const filteredAnnouncements = announcements.filter(
    (ann) =>
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: AnnouncementType) => {
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

  const getTypeBadge = (type: AnnouncementType) => {
    const variants = { urgent: "destructive", warning: "default", event: "secondary", info: "outline" } as const
    const labels = { urgent: "Urgente", warning: "Atenção", event: "Evento", info: "Informação" }

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

      {isLoading && <Card className="p-6">Carregando avisos...</Card>}
      {error && <Card className="p-6 text-sm text-destructive">{error}</Card>}

      <div className="space-y-4">
        {!isLoading && !error && filteredAnnouncements.length === 0 ? (
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
                    <span>Por {announcement.author.name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(announcement.publishAt).toLocaleDateString("pt-BR")}</span>
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
