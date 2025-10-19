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
import type { Reservation } from "@/app/reservas/page"

type ReservationsListProps = {
  reservations: Reservation[]
  onConfirm: (id: number) => void
  onCancel: (id: number) => void
  onEdit: (id: number, data: Partial<Reservation>) => void
  onDelete: (id: number) => void
}

export function ReservationsList({ reservations, onConfirm, onCancel, onEdit, onDelete }: ReservationsListProps) {
  const { toast } = useToast()
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [editForm, setEditForm] = useState<Partial<Reservation>>({})

  const handleConfirmClick = (reservation: Reservation) => {
    onConfirm(reservation.id)
    toast({
      title: "Reserva confirmada",
      description: `A reserva de ${reservation.resident} foi confirmada com sucesso.`,
    })
  }

  const handleCancelClick = (reservation: Reservation) => {
    onCancel(reservation.id)
    toast({
      title: "Reserva cancelada",
      description: `A reserva de ${reservation.resident} foi cancelada.`,
      variant: "destructive",
    })
  }

  const handleEditClick = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setEditForm(reservation)
  }

  const handleSaveEdit = () => {
    if (editingReservation) {
      onEdit(editingReservation.id, editForm)
      toast({
        title: "Reserva atualizada",
        description: "As alterações foram salvas com sucesso.",
      })
      setEditingReservation(null)
      setEditForm({})
    }
  }

  const handleDeleteClick = (reservation: Reservation) => {
    onDelete(reservation.id)
    toast({
      title: "Reserva excluída",
      description: `A reserva de ${reservation.resident} foi excluída.`,
      variant: "destructive",
    })
  }

  const statusConfig = {
    confirmed: { label: "Confirmada", className: "bg-accent/10 text-accent border-accent/20" },
    pending: { label: "Pendente", className: "bg-primary/10 text-primary border-primary/20" },
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
                        <p className="font-semibold text-sm md:text-base">{reservation.area}</p>
                        <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
                          <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {reservation.unit} - {reservation.resident}
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
                      <span>{reservation.time}</span>
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
              <Select value={editForm.area} onValueChange={(value) => setEditForm({ ...editForm, area: value })}>
                <SelectTrigger id="area">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salão de Festas">Salão de Festas</SelectItem>
                  <SelectItem value="Churrasqueira">Churrasqueira</SelectItem>
                  <SelectItem value="Piscina">Piscina</SelectItem>
                  <SelectItem value="Quadra">Quadra</SelectItem>
                  <SelectItem value="Espaço Gourmet">Espaço Gourmet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resident">Morador</Label>
              <Input
                id="resident"
                value={editForm.resident || ""}
                onChange={(e) => setEditForm({ ...editForm, resident: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={editForm.unit || ""}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={editForm.date || ""}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
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
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                value={editForm.time || ""}
                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                placeholder="Ex: 19:00 - 23:00"
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
