"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, AlertCircle, CheckCircle2, Download, DollarSign, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DamageReportItem {
  name: string
  quantity: number
  status: "ok" | "damaged" | "missing"
  damagedQuantity: number
  missingQuantity: number
  unitPrice: number
  totalCost: number
  observations: string
}

interface DamageReport {
  id: string
  reservationId: string
  residentId: string
  residentName: string
  residentUnit: string
  areaId: string
  areaName: string
  areaPrice: number
  date: string
  reservationDate: string
  allItems: DamageReportItem[]
  damagesCost: number
  totalCost: number
  observations: string
  status: string
}

export function ResidentFinancial() {
  const { toast } = useToast()
  const [bills, setBills] = useState([
    {
      id: 1,
      type: "Condomínio",
      month: "Janeiro 2025",
      dueDate: "2025-01-10",
      amount: 850.0,
      status: "paid",
      paidDate: "2025-01-08",
    },
    {
      id: 2,
      type: "Condomínio",
      month: "Fevereiro 2025",
      dueDate: "2025-02-10",
      amount: 850.0,
      status: "pending",
    },
    {
      id: 3,
      type: "Reserva - Salão de Festas",
      month: "Fevereiro 2025",
      dueDate: "2025-02-15",
      amount: 200.0,
      status: "pending",
    },
    {
      id: 4,
      type: "Condomínio",
      month: "Dezembro 2024",
      dueDate: "2024-12-10",
      amount: 850.0,
      status: "paid",
      paidDate: "2024-12-09",
    },
  ])

  const [damageReports, setDamageReports] = useState<DamageReport[]>([])
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)

  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("damageReports") || "[]")
    const userEmail = localStorage.getItem("userEmail")

    // Filter reports for current user (in real app, match by residentId)
    setDamageReports(reports)

    // Add damage reports as bills
    const damageBills = reports.map((report: DamageReport) => ({
      id: `damage-${report.id}`,
      type: `Danos - ${report.areaName}`,
      month: new Date(report.date).toLocaleDateString("pt-BR"),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: report.totalCost,
      status: report.status === "paid" ? "paid" : "pending",
      damageReport: report,
    }))

    setBills((prev) => [...prev.filter((b) => !b.id.toString().startsWith("damage-")), ...damageBills])
  }, [])

  const handlePayment = (billId: number) => {
    setBills(
      bills.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              status: "paid",
              paidDate: new Date().toISOString().split("T")[0],
            }
          : bill,
      ),
    )
    toast({
      title: "Pagamento realizado com sucesso!",
      description: "O comprovante foi enviado para seu email.",
    })
  }

  const handleDownloadBill = (billId: number) => {
    toast({
      title: "Download iniciado",
      description: "O boleto está sendo baixado...",
    })
  }

  const handleViewReport = (report: DamageReport) => {
    setSelectedReport(report)
    setShowReportDialog(true)
  }

  const pendingBills = bills.filter((b) => b.status === "pending")
  const paidBills = bills.filter((b) => b.status === "paid")
  const totalPending = pendingBills.reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Minhas Finanças</h1>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie seus pagamentos e contas do condomínio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Contas Pendentes</p>
              <p className="text-xl md:text-2xl font-bold">{pendingBills.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Total a Pagar</p>
              <p className="text-xl md:text-2xl font-bold">R$ {totalPending.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-accent/10 shrink-0">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Contas Pagas</p>
              <p className="text-xl md:text-2xl font-bold">{paidBills.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {pendingBills.length > 0 && (
        <Card className="p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-base md:text-lg font-semibold">Contas Pendentes</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Pague suas contas antes do vencimento</p>
          </div>

          <div className="space-y-4">
            {pendingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                      bill.type.startsWith("Danos") ? "bg-destructive/10" : "bg-primary/10"
                    }`}
                  >
                    {bill.type.startsWith("Danos") ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">{bill.type}</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Vencimento: {new Date(bill.dueDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {bill.damageReport && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => handleViewReport(bill.damageReport)}
                      >
                        Ver detalhes dos danos
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-left md:text-right">
                    <p className="text-base md:text-lg font-bold">R$ {bill.amount.toFixed(2)}</p>
                    <Badge variant={bill.type.startsWith("Danos") ? "destructive" : "destructive"}>Pendente</Badge>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadBill(bill.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handlePayment(bill.id)}>
                      Pagar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-base md:text-lg font-semibold">Histórico de Pagamentos</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Suas últimas transações</p>
        </div>

        <div className="space-y-3">
          {paidBills.map((bill) => (
            <div
              key={bill.id}
              className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">{bill.type}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Pago em: {bill.paidDate ? new Date(bill.paidDate).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="text-left md:text-right">
                  <p className="text-base md:text-lg font-bold">R$ {bill.amount.toFixed(2)}</p>
                  <Badge variant="secondary" className="mt-1">
                    Pago
                  </Badge>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDownloadBill(bill.id)} className="shrink-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório Completo de Danos - {selectedReport?.areaName}</DialogTitle>
            <DialogDescription>Inventário completo da área após sua reserva</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Morador:</span>
                    <p className="font-medium">{selectedReport.residentName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unidade:</span>
                    <p className="font-medium">{selectedReport.residentUnit}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Área:</span>
                    <p className="font-medium">{selectedReport.areaName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data da Reserva:</span>
                    <p className="font-medium">{selectedReport.reservationDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data da Vistoria:</span>
                    <p className="font-medium">{new Date(selectedReport.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </Card>

              <div>
                <h4 className="font-semibold mb-3 text-lg">Inventário Completo da Área</h4>
                <p className="text-sm text-muted-foreground mb-3">Todos os itens verificados após o uso da área</p>
                <div className="space-y-2">
                  {selectedReport.allItems?.map((item, index) => {
                    const hasIssues = item.damagedQuantity > 0 || item.missingQuantity > 0
                    return (
                      <Card
                        key={index}
                        className={`p-4 ${hasIssues ? "border-destructive/50 bg-destructive/5" : "border-green-500/30 bg-green-500/5"}`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{item.name}</span>
                                {item.status === "ok" && <Badge className="bg-green-500 text-xs">✓ OK</Badge>}
                                {item.status === "damaged" && (
                                  <Badge variant="destructive" className="text-xs">
                                    ⚠ Danificado
                                  </Badge>
                                )}
                                {item.status === "missing" && (
                                  <Badge variant="destructive" className="text-xs">
                                    ✗ Faltando
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Quantidade total: {item.quantity} • Valor unitário: R$ {item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            {hasIssues && (
                              <span className="font-bold text-destructive text-lg ml-2">
                                R$ {item.totalCost.toFixed(2)}
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

              {selectedReport.observations && (
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2 text-sm">Observações Gerais</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.observations}</p>
                </Card>
              )}

              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <h4 className="font-semibold mb-3">Resumo Financeiro</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Custo dos danos e itens faltantes:</span>
                    <span className="font-medium text-destructive">R$ {selectedReport.damagesCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valor da reserva ({selectedReport.areaName}):</span>
                    <span className="font-medium">R$ {selectedReport.areaPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total a pagar:</span>
                    <span className="text-lg">R$ {selectedReport.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Este relatório foi gerado após a vistoria da área comum. Os valores apresentados referem-se aos itens
                  danificados ou faltantes identificados após o uso da área. O pagamento deve ser realizado junto com o
                  valor da reserva.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
