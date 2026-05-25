"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User, X, Check, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { CommonArea, Reservation } from "@/lib/api"

type ReservationsListProps = {
  reservations: Reservation[]
  areas: CommonArea[]
  onConfirm: (id: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
  onEdit: (id: string, data: Partial<Reservation>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ReservationsList({ reservations, areas, onConfirm, onCancel, onEdit, onDelete }: ReservationsListProps) {
  const { toast } = useToast()
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [editForm, setEditForm] = useState<Partial<Reservation>>({})

  const toDateInput = (value: string) => new Date(value).toISOString().split("T")[0]
  const toTimeInput = (value: string) => new Date(value).toISOString().slice(11, 16)
  const combineDateTime = (date: string, time: string) => `${date}T${time}:00.000Z`
  const formatTimeRange = (reservation: Reservation) =>
    `${new Date(reservation.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(
      reservation.endTime,
    ).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`

  const handleConfirmClick = async (reservation: Reservation) => {
    await onConfirm(reservation.id)
    toast({
      title: "Reserva confirmada",
      description: `A reserva de ${reservation.user.name} foi confirmada com sucesso.`,
    })
  }

  const handleCancelClick = async (reservation: Reservation) => {
    await onCancel(reservation.id)
    toast({
      title: "Reserva cancelada",
      description: `A reserva de ${reservation.user.name} foi cancelada.`,
      variant: "destructive",
    })
  }

  const handleEditClick = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setEditForm(reservation)
  }

  const handleSaveEdit = async () => {
    if (editingReservation) {
      await onEdit(editingReservation.id, editForm)
      toast({
        title: "Reserva atualizada",
        description: "As alterações foram salvas com sucesso.",
      })
      setEditingReservation(null)
      setEditForm({})
    }
  }

  const handleDeleteClick = async (reservation: Reservation) => {
    await onDelete(reservation.id)
    toast({
      title: "Reserva excluída",
      description: `A reserva de ${reservation.user.name} foi excluída.`,
      variant: "destructive",
    })
  }

  const statusConfig = {
    confirmed: { label: "Confirmada", className: "bg-accent/10 text-accent border-accent/20" },
    pending: { label: "Pendente", className: "bg-primary/10 text-primary border-primary/20" },
    completed: { label: "Concluída", className: "bg-muted text-muted-foreground border-border" },
    cancelled: {
      label: "Cancelada",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  }

  const activeReservations = reservations.filter((r) => r.status !== "cancelled")

  return (
    <>
      <Card className="p-4 md:p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold">Próximas Reservas</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Agendamentos confirmados e pendentes</p>
          </div>

          <div className="space-y-3">
            {activeReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col md:flex-row md:items-start md:justify-between p-3 md:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-3"
              >
                <div className="flex gap-3 md:gap-4 flex-1">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm md:text-base">{reservation.area.name}</p>
                        <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
                          <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {reservation.user.apartment ?? "Sem unidade"} - {reservation.user.name}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${statusConfig[reservation.status as keyof typeof statusConfig].className} text-xs`}
                      >
                        {statusConfig[reservation.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reservation.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span>{formatTimeRange(reservation)}</span>
                      <span className="hidden md:inline">•</span>
                      <span>{reservation.guests} convidados</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 md:ml-4 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => handleEditClick(reservation)}
                    title="Editar reserva"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {reservation.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-accent/10 bg-transparent"
                        onClick={() => handleConfirmClick(reservation)}
                        title="Confirmar reserva"
                      >
                        <Check className="h-4 w-4 text-accent" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 bg-transparent"
                        onClick={() => handleCancelClick(reservation)}
                        title="Cancelar reserva"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {reservation.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 bg-transparent"
                      onClick={() => handleDeleteClick(reservation)}
                      title="Excluir reserva"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={!!editingReservation} onOpenChange={() => setEditingReservation(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>Faça alterações nos detalhes da reserva abaixo.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="area">Área Comum</Label>
              <Select value={editForm.areaId} onValueChange={(value) => setEditForm({ ...editForm, areaId: value })}>
                <SelectTrigger id="area">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resident">Morador</Label>
              <Input id="resident" value={editingReservation?.user.name || ""} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input id="unit" value={editingReservation?.user.apartment || ""} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={editForm.date ? toDateInput(editForm.date) : ""}
                  onChange={(e) => setEditForm({ ...editForm, date: `${e.target.value}T00:00:00.000Z` })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guests">Convidados</Label>
                <Input
                  id="guests"
                  type="number"
                  value={editForm.guests || ""}
                  onChange={(e) => setEditForm({ ...editForm, guests: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startTime">Início</Label>
              <Input
                id="startTime"
                type="time"
                value={editForm.startTime ? toTimeInput(editForm.startTime) : ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    startTime: combineDateTime(editForm.date ? toDateInput(editForm.date) : toDateInput(new Date().toISOString()), e.target.value),
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endTime">Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={editForm.endTime ? toTimeInput(editForm.endTime) : ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    endTime: combineDateTime(editForm.date ? toDateInput(editForm.date) : toDateInput(new Date().toISOString()), e.target.value),
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: "confirmed" | "pending" | "cancelled") =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReservation(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
