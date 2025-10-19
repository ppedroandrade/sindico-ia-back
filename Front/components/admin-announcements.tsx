"use client"

import { useState } from "react"
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

interface Announcement {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "urgent" | "event"
  date: Date
  author: string
}

const initialAnnouncements: Announcement[] = [
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

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as Announcement["type"],
    date: new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (editingAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === editingAnnouncement.id
            ? {
                ...ann,
                ...formData,
                date: new Date(formData.date),
              }
            : ann,
        ),
      )
      toast({
        title: "Aviso atualizado",
        description: "O aviso foi atualizado com sucesso",
      })
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        date: new Date(formData.date),
        author: "Administração",
      }
      setAnnouncements((prev) => [newAnnouncement, ...prev])
      toast({
        title: "Aviso criado",
        description: "O aviso foi publicado com sucesso",
      })
    }

    setIsDialogOpen(false)
    setEditingAnnouncement(null)
    setFormData({
      title: "",
      content: "",
      type: "info",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      date: announcement.date.toISOString().split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id))
    toast({
      title: "Aviso excluído",
      description: "O aviso foi removido com sucesso",
    })
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Avisos e Comunicados</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie os avisos do condomínio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingAnnouncement(null)
                setFormData({
                  title: "",
                  content: "",
                  type: "info",
                  date: new Date().toISOString().split("T")[0],
                })
              }}
            >
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
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Assembleia Geral"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Announcement["type"]) => setFormData({ ...formData, type: value })}
                  >
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
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Descreva o aviso..."
                  rows={6}
                />
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

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-2 flex-1">
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
