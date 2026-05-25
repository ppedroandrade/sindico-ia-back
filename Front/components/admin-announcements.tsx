"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Bell, Calendar, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiError, apiRequest, type Announcement, type AnnouncementType } from "@/lib/api"

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as AnnouncementType,
    publishAt: new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()

  const loadAnnouncements = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setAnnouncements((await apiRequest("/announcements")) as Announcement[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os avisos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const resetForm = () => {
    setEditingAnnouncement(null)
    setFormData({
      title: "",
      content: "",
      type: "info",
      publishAt: new Date().toISOString().split("T")[0],
    })
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Erro", description: "Preencha título e conteúdo", variant: "destructive" })
      return
    }

    const saved = (await apiRequest(
      editingAnnouncement ? `/announcements/${editingAnnouncement.id}` : "/announcements",
      {
        method: editingAnnouncement ? "PATCH" : "POST",
        body: JSON.stringify({
          ...formData,
          publishAt: `${formData.publishAt}T00:00:00.000Z`,
        }),
      },
    )) as Announcement

    setAnnouncements((prev) =>
      editingAnnouncement ? prev.map((ann) => (ann.id === saved.id ? saved : ann)) : [saved, ...prev],
    )
    setIsDialogOpen(false)
    resetForm()
    toast({ title: editingAnnouncement ? "Aviso atualizado" : "Aviso publicado" })
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      publishAt: new Date(announcement.publishAt).toISOString().split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await apiRequest(`/announcements/${id}`, { method: "DELETE" })
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id))
    toast({ title: "Aviso excluído" })
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Avisos e Comunicados</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie os avisos do condomínio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: AnnouncementType) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishAt">Data</Label>
                  <Input
                    id="publishAt"
                    type="date"
                    value={formData.publishAt}
                    onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>{editingAnnouncement ? "Atualizar" : "Publicar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <Card className="p-6">Carregando avisos...</Card>}
      {error && (
        <Card className="space-y-4 p-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={loadAnnouncements}>Tentar novamente</Button>
        </Card>
      )}

      <div className="space-y-4">
        {!isLoading &&
          !error &&
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-2 flex-1">
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
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-xs md:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
