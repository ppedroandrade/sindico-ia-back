"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, MapPin, Plus, X, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { ApiError, type CommonArea, type Reservation } from "@/lib/api"

interface ResidentReservationsProps {
  reservations: Reservation[]
  areas: CommonArea[]
  onNewReservation: (reservation: {
    areaId: string
    date: string
    startTime: string
    endTime: string
    guests: number
    observations?: string
  }) => Promise<void>
  onCancel: (id: string) => Promise<void>
}

export function ResidentReservations({ reservations, areas, onNewReservation, onCancel }: ResidentReservationsProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userUnit, setUserUnit] = useState("")

  // Form state
  const [selectedArea, setSelectedArea] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [guests, setGuests] = useState("")

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "")
    setUserUnit(localStorage.getItem("userUnit") || "")
  }, [])

  // Filter reservations for current user
  const myReservations = reservations.filter((r) => !userUnit || r.user.apartment === userUnit)
  const pendingReservations = myReservations.filter((r) => r.status === "pending")
  const confirmedReservations = myReservations.filter((r) => r.status === "confirmed")

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await onNewReservation({
        areaId: selectedArea,
        date: `${date}T00:00:00.000Z`,
        startTime: `${date}T${startTime}:00.000Z`,
        endTime: `${date}T${endTime}:00.000Z`,
        guests: Number.parseInt(guests),
      })

      toast({
        title: "Solicitação enviada!",
        description: "Sua reserva está aguardando aprovação do síndico.",
      })

      setSelectedArea("")
      setDate("")
      setStartTime("")
      setEndTime("")
      setGuests("")
      setIsDialogOpen(false)
    } catch (err) {
      toast({
        title: "Reserva não enviada",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleCancelReservation = async (id: string) => {
    await onCancel(id)
    toast({
      title: "Reserva cancelada",
      description: "Sua reserva foi cancelada com sucesso.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-accent text-accent-foreground">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Confirmada
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Minhas Reservas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Solicite e gerencie suas reservas de áreas comuns
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Solicitar Reserva</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitReservation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área Comum</Label>
                <Select value={selectedArea} onValueChange={setSelectedArea} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas
                      .filter((area) => area.available)
                      .map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name} - R$ {area.pricePerHour.toFixed(2)}/h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Horário Início</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Horário Fim</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Número de Convidados</Label>
                <Input
                  id="guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  min="1"
                  placeholder="Ex: 30"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Solicitar Reserva</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Reservas</p>
              <p className="text-2xl font-bold">{myReservations.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <AlertCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aguardando Aprovação</p>
              <p className="text-2xl font-bold">{pendingReservations.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
              <p className="text-2xl font-bold">{confirmedReservations.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Areas */}
      <Card className="p-4 md:p-6">
        <h2 className="mb-4 text-base md:text-lg font-semibold">Áreas Disponíveis</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <div key={area.id} className="rounded-lg border p-3 md:p-4">
              <div className="mb-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm md:text-base">{area.name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">R$ {area.pricePerHour.toFixed(2)}/h</p>
            </div>
          ))}
        </div>
      </Card>

      {/* My Reservations */}
      <Card className="p-4 md:p-6">
        <h2 className="mb-4 text-base md:text-lg font-semibold">Minhas Solicitações</h2>

        {myReservations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm md:text-base">Você ainda não tem reservas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg border p-3 md:p-4 gap-3"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm md:text-base">{reservation.area.name}</p>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reservation.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reservation.startTime).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(reservation.endTime).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {reservation.guests} pessoas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  {getStatusBadge(reservation.status)}
                  {reservation.status !== "cancelled" && (
                    <Button size="sm" variant="outline" onClick={() => handleCancelReservation(reservation.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
