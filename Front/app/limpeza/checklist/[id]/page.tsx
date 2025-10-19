"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, XCircle, Send } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChecklistItem {
  id: string
  name: string
  quantity: number
  status: "ok" | "damaged" | "missing"
  damagedQuantity: number
  missingQuantity: number
  unitPrice: number
  observations: string
}

export default function ChecklistPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [generalObservations, setGeneralObservations] = useState("")
  const [selectedResident, setSelectedResident] = useState("")
  const [showDamageReport, setShowDamageReport] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState("")

  const areaNames: Record<string, string> = {
    "1": "Salão de Festas",
    "2": "Churrasqueira",
    "3": "Piscina",
    "4": "Academia",
    "5": "Playground",
    "6": "Salão de Jogos",
  }

  const areaName = areaNames[params.id as string] || "Área"

  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "1",
      name: "Mesas",
      quantity: 8,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 250,
      observations: "",
    },
    {
      id: "2",
      name: "Cadeiras",
      quantity: 40,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 180,
      observations: "",
    },
    {
      id: "3",
      name: "Copos",
      quantity: 20,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 15,
      observations: "",
    },
    {
      id: "4",
      name: "Freezer",
      quantity: 1,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 2500,
      observations: "",
    },
    {
      id: "5",
      name: "Controle do Ar",
      quantity: 1,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 120,
      observations: "",
    },
    {
      id: "6",
      name: "Ventiladores",
      quantity: 4,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 350,
      observations: "",
    },
    {
      id: "7",
      name: "Pratos",
      quantity: 30,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 25,
      observations: "",
    },
    {
      id: "8",
      name: "Talheres (jogos)",
      quantity: 30,
      status: "ok",
      damagedQuantity: 0,
      missingQuantity: 0,
      unitPrice: 40,
      observations: "",
    },
  ])

  const residents = [
    { id: "1", name: "João Silva", unit: "Apto 101", email: "joao@email.com" },
    { id: "2", name: "Maria Santos", unit: "Apto 202", email: "maria@email.com" },
    { id: "3", name: "Pedro Costa", unit: "Apto 303", email: "pedro@email.com" },
  ]

  const reservations = [
    {
      id: "1",
      residentId: "1",
      residentName: "João Silva",
      unit: "Apto 101",
      area: "Salão de Festas",
      date: "17/10/2025",
    },
    {
      id: "2",
      residentId: "2",
      residentName: "Maria Santos",
      unit: "Apto 202",
      area: "Churrasqueira",
      date: "17/10/2025",
    },
    {
      id: "3",
      residentId: "3",
      residentName: "Pedro Costa",
      unit: "Apto 303",
      area: "Salão de Festas",
      date: "18/10/2025",
    },
  ]

  const updateItemStatus = (itemId: string, status: ChecklistItem["status"]) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          if (status === "ok") {
            return { ...item, status, damagedQuantity: 0, missingQuantity: 0 }
          }
          return { ...item, status }
        }
        return item
      }),
    )
  }

  const updateItemObservations = (itemId: string, observations: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, observations } : item)))
  }

  const updateDamagedQuantity = (itemId: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const validQuantity = Math.max(0, Math.min(quantity, item.quantity))
          return { ...item, damagedQuantity: validQuantity }
        }
        return item
      }),
    )
  }

  const updateMissingQuantity = (itemId: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const validQuantity = Math.max(0, Math.min(quantity, item.quantity))
          return { ...item, missingQuantity: validQuantity }
        }
        return item
      }),
    )
  }

  const calculateTotalCost = () => {
    return items.reduce((total, item) => {
      const damagedCost = item.damagedQuantity * item.unitPrice
      const missingCost = item.missingQuantity * item.unitPrice
      return total + damagedCost + missingCost
    }, 0)
  }

  const getPendingItems = () => {
    return items.filter((item) => item.damagedQuantity > 0 || item.missingQuantity > 0)
  }

  const handleSaveProgress = () => {
    toast({
      title: "Progresso salvo",
      description: "Você pode continuar depois",
    })
  }

  const handleFinishCleaning = () => {
    setShowFinishDialog(true)
  }

  const confirmFinish = () => {
    const pendingItems = getPendingItems()
    const totalCost = calculateTotalCost()

    if (selectedReservation) {
      const reservation = reservations.find((r) => r.id === selectedReservation)
      const areaPrice = 200

      const damageReport = {
        id: Date.now().toString(),
        reservationId: selectedReservation,
        residentId: reservation?.residentId,
        residentName: reservation?.residentName,
        residentUnit: reservation?.unit,
        areaId: params.id,
        areaName: areaName,
        areaPrice: areaPrice,
        date: new Date().toISOString(),
        reservationDate: reservation?.date,
        allItems: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          status: item.status,
          damagedQuantity: item.damagedQuantity,
          missingQuantity: item.missingQuantity,
          unitPrice: item.unitPrice,
          totalCost: (item.damagedQuantity + item.missingQuantity) * item.unitPrice,
          observations: item.observations,
        })),
        damagesCost: totalCost,
        totalCost: totalCost + areaPrice,
        observations: generalObservations,
        status: "pending",
      }

      const existingReports = JSON.parse(localStorage.getItem("damageReports") || "[]")
      localStorage.setItem("damageReports", JSON.stringify([...existingReports, damageReport]))

      toast({
        title: "Limpeza finalizada!",
        description: `Relatório de danos enviado para ${reservation?.residentName}`,
      })
    } else {
      toast({
        title: "Limpeza finalizada!",
        description: pendingItems.length > 0 ? `${pendingItems.length} pendências registradas` : "Tudo em ordem",
      })
    }

    router.push("/limpeza")
  }

  const handleSendDamageReport = () => {
    if (!selectedReservation) {
      toast({
        title: "Erro",
        description: "Selecione a reserva responsável",
        variant: "destructive",
      })
      return
    }
    setShowDamageReport(true)
  }

  const getStatusButton = (item: ChecklistItem, status: ChecklistItem["status"]) => {
    const isActive = item.status === status
    const configs = {
      ok: { icon: CheckCircle2, label: "Ok", variant: "default" as const, color: "bg-green-500" },
      damaged: { icon: AlertTriangle, label: "Danificado", variant: "secondary" as const, color: "bg-yellow-500" },
      missing: { icon: XCircle, label: "Faltando", variant: "destructive" as const, color: "bg-red-500" },
    }

    const config = configs[status]
    const Icon = config.icon

    return (
      <Button
        key={status}
        variant={isActive ? config.variant : "outline"}
        size="sm"
        className="flex-1 text-xs sm:text-sm"
        onClick={() => updateItemStatus(item.id, status)}
      >
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        {config.label}
      </Button>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Checklist - {areaName}</h1>
              <p className="text-sm text-muted-foreground">Verifique todos os itens</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveProgress} className="text-xs sm:text-sm bg-transparent">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={handleFinishCleaning} className="text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantidade total: {item.quantity} • Valor unitário: R$ {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  {(item.damagedQuantity > 0 || item.missingQuantity > 0) && (
                    <Badge variant="destructive" className="self-start sm:self-center">
                      Custo: R$ {((item.damagedQuantity + item.missingQuantity) * item.unitPrice).toFixed(2)}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {["ok", "damaged", "missing"].map((status) =>
                    getStatusButton(item, status as ChecklistItem["status"]),
                  )}
                </div>

                {item.status === "damaged" && (
                  <div className="space-y-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="space-y-2">
                      <Label htmlFor={`damaged-qty-${item.id}`} className="text-sm font-medium">
                        Quantos itens estão danificados?
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`damaged-qty-${item.id}`}
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.damagedQuantity}
                          onChange={(e) => updateDamagedQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                          className="max-w-[120px]"
                        />
                        <span className="text-sm text-muted-foreground">de {item.quantity}</span>
                      </div>
                      {item.damagedQuantity > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Custo estimado: R$ {(item.damagedQuantity * item.unitPrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`obs-damaged-${item.id}`} className="text-sm">
                        Observações
                      </Label>
                      <Textarea
                        id={`obs-damaged-${item.id}`}
                        placeholder="Descreva o problema..."
                        value={item.observations}
                        onChange={(e) => updateItemObservations(item.id, e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {item.status === "missing" && (
                  <div className="space-y-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="space-y-2">
                      <Label htmlFor={`missing-qty-${item.id}`} className="text-sm font-medium">
                        Quantos itens estão faltando?
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`missing-qty-${item.id}`}
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.missingQuantity}
                          onChange={(e) => updateMissingQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                          className="max-w-[120px]"
                        />
                        <span className="text-sm text-muted-foreground">de {item.quantity}</span>
                      </div>
                      {item.missingQuantity > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Custo estimado: R$ {(item.missingQuantity * item.unitPrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`obs-missing-${item.id}`} className="text-sm">
                        Observações
                      </Label>
                      <Textarea
                        id={`obs-missing-${item.id}`}
                        placeholder="Descreva o que está faltando..."
                        value={item.observations}
                        onChange={(e) => updateItemObservations(item.id, e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {getPendingItems().length > 0 && (
          <Card className="p-4 sm:p-6 bg-destructive/5 border-destructive/20">
            <h3 className="font-semibold text-base sm:text-lg mb-2">Resumo de Pendências</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {getPendingItems().length} item(ns) com problema • Custo estimado de reposição: R${" "}
              {calculateTotalCost().toFixed(2)}
            </p>
            <div className="space-y-2 mb-4">
              {getPendingItems().map((item) => (
                <div key={item.id} className="space-y-1">
                  {item.damagedQuantity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>
                        {item.name} - {item.damagedQuantity} danificado(s)
                      </span>
                      <span className="font-medium">R$ {(item.damagedQuantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  )}
                  {item.missingQuantity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>
                        {item.name} - {item.missingQuantity} faltando
                      </span>
                      <span className="font-medium">R$ {(item.missingQuantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t">
              <Label>Reserva Responsável</Label>
              <Select value={selectedReservation} onValueChange={setSelectedReservation}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a reserva..." />
                </SelectTrigger>
                <SelectContent>
                  {reservations
                    .filter((r) => r.area === areaName)
                    .map((reservation) => (
                      <SelectItem key={reservation.id} value={reservation.id}>
                        {reservation.residentName} - {reservation.unit} ({reservation.date})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedReservation && (
                <Button size="sm" variant="outline" onClick={handleSendDamageReport} className="w-full bg-transparent">
                  <Send className="h-4 w-4 mr-2" />
                  Gerar Relatório Completo de Danos
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Limpeza</DialogTitle>
            <DialogDescription>Adicione observações gerais sobre a limpeza (opcional)</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Ex: Área limpa e organizada. Todos os itens verificados..."
              value={generalObservations}
              onChange={(e) => setGeneralObservations(e.target.value)}
              className="min-h-[120px]"
            />

            {getPendingItems().length > 0 && (
              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium mb-2">Pendências registradas:</p>
                <ul className="text-sm space-y-1">
                  {getPendingItems().map((item) => (
                    <li key={item.id}>
                      • {item.name}
                      {item.damagedQuantity > 0 && ` - ${item.damagedQuantity} danificado(s)`}
                      {item.missingQuantity > 0 && ` - ${item.missingQuantity} faltando`}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold mt-3">Custo total: R$ {calculateTotalCost().toFixed(2)}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmFinish}>Confirmar e Finalizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDamageReport} onOpenChange={setShowDamageReport}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório Completo de Danos - {areaName}</DialogTitle>
            <DialogDescription>Relatório detalhado que será enviado ao morador</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Morador:</span>
                  <p className="font-medium">{reservations.find((r) => r.id === selectedReservation)?.residentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Unidade:</span>
                  <p className="font-medium">{reservations.find((r) => r.id === selectedReservation)?.unit}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Área:</span>
                  <p className="font-medium">{areaName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data da Reserva:</span>
                  <p className="font-medium">{reservations.find((r) => r.id === selectedReservation)?.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data da Vistoria:</span>
                  <p className="font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </Card>

            <div>
              <h4 className="font-semibold mb-3 text-lg">Inventário Completo da Área</h4>
              <div className="space-y-2">
                {items.map((item) => {
                  const hasIssues = item.damagedQuantity > 0 || item.missingQuantity > 0
                  return (
                    <Card
                      key={item.id}
                      className={`p-4 ${hasIssues ? "border-destructive/50 bg-destructive/5" : "border-green-500/30 bg-green-500/5"}`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              {item.status === "ok" && <Badge className="bg-green-500">✓ OK</Badge>}
                              {item.status === "damaged" && <Badge variant="destructive">⚠ Danificado</Badge>}
                              {item.status === "missing" && <Badge variant="destructive">✗ Faltando</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Quantidade total: {item.quantity} • Valor unitário: R$ {item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          {hasIssues && (
                            <span className="font-bold text-destructive text-lg">
                              R$ {((item.damagedQuantity + item.missingQuantity) * item.unitPrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {item.damagedQuantity > 0 && (
                          <div className="text-sm bg-yellow-500/10 p-2 rounded">
                            <p className="font-medium text-yellow-700 dark:text-yellow-400">
                              • {item.damagedQuantity} danificado(s) × R$ {item.unitPrice.toFixed(2)} = R${" "}
                              {(item.damagedQuantity * item.unitPrice).toFixed(2)}
                            </p>
                            {item.observations && (
                              <p className="text-xs text-muted-foreground mt-1">Obs: {item.observations}</p>
                            )}
                          </div>
                        )}

                        {item.missingQuantity > 0 && (
                          <div className="text-sm bg-red-500/10 p-2 rounded">
                            <p className="font-medium text-red-700 dark:text-red-400">
                              • {item.missingQuantity} faltando × R$ {item.unitPrice.toFixed(2)} = R${" "}
                              {(item.missingQuantity * item.unitPrice).toFixed(2)}
                            </p>
                            {item.observations && (
                              <p className="text-xs text-muted-foreground mt-1">Obs: {item.observations}</p>
                            )}
                          </div>
                        )}

                        {item.status === "ok" && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            ✓ Todos os {item.quantity} itens em perfeito estado
                          </p>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-3">Resumo Financeiro</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Custo dos danos e itens faltantes:</span>
                  <span className="font-medium text-destructive">R$ {calculateTotalCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor da reserva ({areaName}):</span>
                  <span className="font-medium">R$ 200,00</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total a pagar:</span>
                  <span className="text-lg">R$ {(calculateTotalCost() + 200).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {generalObservations && (
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold mb-2 text-sm">Observações Gerais</h4>
                <p className="text-sm text-muted-foreground">{generalObservations}</p>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDamageReport(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowDamageReport(false)
                setShowFinishDialog(true)
              }}
            >
              Confirmar e Enviar ao Morador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
