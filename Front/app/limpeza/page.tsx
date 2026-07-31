"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EmptyState } from "@/components/empty-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCurrentUser } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ApiError, apiRequest, type Reservation } from "@/lib/api"
import { Calendar, Clock, MapPin, Package, Users } from "lucide-react"

export default function LimpezaPage() {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [target, setTarget] = useState<Reservation | null>(null)
  const [itemsVerified, setItemsVerified] = useState(true)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (currentUser?.role === "admin") {
      router.push("/limpeza/relatorios")
    }
  }, [currentUser, router])

  const loadReservations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setReservations((await apiRequest("/reservations")) as Reservation[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as reservas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const now = Date.now()
  const pendingCleaning = reservations
    .filter((r) => r.status !== "cancelled" && r.cleaningStatus === "pending" && new Date(r.endTime).getTime() < now)
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())

  const openDialog = (reservation: Reservation) => {
    setTarget(reservation)
    setItemsVerified(true)
    setNotes("")
  }

  const confirmCleaning = async () => {
    if (!target) return
    setIsSaving(true)
    try {
      const updated = (await apiRequest(`/reservations/${target.id}/cleaning`, {
        method: "PATCH",
        body: JSON.stringify({ itemsVerified, notes: notes.trim() || undefined }),
      })) as Reservation
      setReservations((current) => current.map((r) => (r.id === updated.id ? updated : r)))
      toast({
        title: "Limpeza registrada",
        description: itemsVerified
          ? "Área marcada como limpa e itens conferidos."
          : "Área marcada como limpa — administrador foi avisado sobre itens não conferidos.",
        variant: "success",
      })
      setTarget(null)
    } catch (err) {
      toast({
        title: "Não foi possível registrar",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Áreas para Limpar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Reservas encerradas que ainda precisam ser limpas e conferidas
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : error ? (
          <Card className="space-y-3 p-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={loadReservations}>Tentar novamente</Button>
          </Card>
        ) : pendingCleaning.length === 0 ? (
          <EmptyState
            title="Nenhuma área pendente de limpeza"
            description="Quando uma reserva terminar, ela aparece aqui para você registrar a limpeza."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingCleaning.map((reservation) => (
              <Card key={reservation.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{reservation.area.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.user.name}
                        {reservation.user.apartment ? ` · Apto ${reservation.user.apartment}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Aguardando limpeza</Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(reservation.date).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(reservation.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {new Date(reservation.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {reservation.guests} convidados
                  </span>
                </div>

                {reservation.area.items.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      Itens do ambiente
                    </p>
                    <ul className="space-y-1 text-sm">
                      {reservation.area.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full" onClick={() => openDialog(reservation)}>
                  Marcar como limpo
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar limpeza — {target?.area.name}</DialogTitle>
            <DialogDescription>
              Confira os itens listados no ambiente antes de confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {target && target.area.items.length > 0 && (
              <ul className="space-y-1 rounded-lg border p-3 text-sm">
                {target.area.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="items-verified"
                checked={itemsVerified}
                onCheckedChange={(checked) => setItemsVerified(checked === true)}
              />
              <Label htmlFor="items-verified" className="font-normal leading-snug">
                Todos os itens listados foram conferidos e estão no ambiente
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações {itemsVerified ? "(opcional)" : ""}</Label>
              <Textarea
                id="notes"
                placeholder={itemsVerified ? "Ex: tudo certo, sem observações" : "Descreva o que está faltando ou danificado"}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={confirmCleaning} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Confirmar limpeza"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
