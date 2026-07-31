"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePicker } from "@/components/ui/date-picker"
import { ApiError, apiRequest, type Payment, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/components/auth-context"
import { formatCurrency } from "@/lib/format"
import { localDateOnlyToISO } from "@/lib/date"
import { CreditCard, DollarSign, Plus } from "lucide-react"

type PaymentForm = {
  userId: string
  amount: string
  dueDate: string
  type: string
  referenceMonth: string
}

const initialForm: PaymentForm = {
  userId: "",
  amount: "",
  dueDate: "",
  type: "condominio",
  referenceMonth: "",
}

export default function FinanceiroPage() {
  const currentUser = useCurrentUser()
  const userRole = currentUser?.role ?? ""
  const [payments, setPayments] = useState<Payment[]>([])
  const [residents, setResidents] = useState<User[]>([])
  const [form, setForm] = useState(initialForm)
  const [batchForm, setBatchForm] = useState({ amount: "", dueDate: "", type: "condominio", referenceMonth: "" })
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [batchFieldErrors, setBatchFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const loadedPayments = (await apiRequest("/payments")) as Payment[]
      setPayments(loadedPayments)
      setReport(await apiRequest("/payments/report"))
      if (userRole === "admin") {
        const users = (await apiRequest("/users")) as User[]
        setResidents(users.filter((user) => user.role === "morador" && user.active !== false))
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar financeiro")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!currentUser) return
    loadData()
  }, [currentUser])

  const totals = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        if (payment.status === "paid") acc.paid += payment.amount
        else acc.pending += payment.amount
        return acc
      },
      { paid: 0, pending: 0 },
    )
  }, [payments])

  const validatePayment = () => {
    const errors: Record<string, string> = {}
    if (!form.userId) errors.userId = "Selecione um morador."
    if (!form.amount || Number(form.amount) <= 0) errors.amount = "Informe um valor maior que zero."
    if (!form.dueDate) errors.dueDate = "Selecione a data de vencimento."
    if (!form.type.trim()) errors.type = "Informe o tipo da cobrança."
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreatePayment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validatePayment()) return

    setIsSaving(true)
    try {
      const created = (await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify({
          userId: form.userId,
          amount: Number(form.amount),
          dueDate: localDateOnlyToISO(form.dueDate),
          type: form.type,
          referenceMonth: form.referenceMonth || undefined,
        }),
      })) as Payment
      setPayments((current) => [created, ...current])
      setForm(initialForm)
      setFieldErrors({})
      toast({ title: "Cobrança criada", variant: "success" })
    } catch (err) {
      toast({
        title: "Erro ao criar cobrança",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const markPaid = async (paymentId: string) => {
    const updated = (await apiRequest(`/payments/${paymentId}/pay`, { method: "PATCH" })) as Payment
    setPayments((current) => current.map((payment) => (payment.id === paymentId ? updated : payment)))
  }

  const validateBatch = () => {
    const errors: Record<string, string> = {}
    if (!batchForm.amount || Number(batchForm.amount) <= 0) errors.amount = "Informe um valor maior que zero."
    if (!batchForm.dueDate) errors.dueDate = "Selecione a data de vencimento."
    if (!batchForm.type.trim()) errors.type = "Informe o tipo da cobrança."
    setBatchFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateBatch = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateBatch()) return
    setIsSaving(true)
    try {
      const created = (await apiRequest("/payments/batch", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(batchForm.amount),
          dueDate: localDateOnlyToISO(batchForm.dueDate),
          type: batchForm.type,
          referenceMonth: batchForm.referenceMonth || undefined,
        }),
      })) as Payment[]
      setPayments((current) => [...created, ...current])
      setBatchForm({ amount: "", dueDate: "", type: "condominio", referenceMonth: "" })
      setBatchFieldErrors({})
      toast({ title: "Cobranças geradas", description: `${created.length} cobranças criadas.`, variant: "success" })
      loadData()
    } catch (err) {
      toast({
        title: "Erro ao gerar cobranças",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const showPix = async (paymentId: string) => {
    const pix = await apiRequest(`/payments/${paymentId}/pix`) as { pixCopyPaste: string }
    toast({
      title: "Pix gerado",
      description: pix.pixCopyPaste,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm md:text-base text-muted-foreground">Cobranças, pagamentos e inadimplência</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Total pendente</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.pending)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Total recebido</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.paid)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Cobranças</p>
            <p className="mt-2 text-2xl font-semibold">{payments.length}</p>
          </Card>
        </div>

        {userRole === "admin" && (
          <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-4 md:p-6">
            <form onSubmit={handleCreatePayment} noValidate className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Nova cobrança</h2>
                  <p className="text-sm text-muted-foreground">Crie uma cobrança para um morador</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-2">
                  <Label>Morador</Label>
                  <Select value={form.userId} onValueChange={(userId) => setForm({ ...form, userId })}>
                    <SelectTrigger aria-invalid={!!fieldErrors.userId}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.name} {resident.apartment ? `- Apto ${resident.apartment}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.userId && <p className="text-xs text-destructive">{fieldErrors.userId}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    aria-invalid={!!fieldErrors.amount}
                  />
                  {fieldErrors.amount && <p className="text-xs text-destructive">{fieldErrors.amount}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <DatePicker value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} />
                  {fieldErrors.dueDate && <p className="text-xs text-destructive">{fieldErrors.dueDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                    aria-invalid={!!fieldErrors.type}
                  />
                  {fieldErrors.type && <p className="text-xs text-destructive">{fieldErrors.type}</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || residents.length === 0}>
                  {isSaving ? "Criando..." : "Criar cobrança"}
                </Button>
              </div>
            </form>
          </Card>
          <Card className="p-4 md:p-6">
            <form onSubmit={generateBatch} noValidate className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Geração em lote</h2>
                <p className="text-sm text-muted-foreground">Crie cobrança para todos os moradores ativos.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={batchForm.amount}
                    onChange={(event) => setBatchForm({ ...batchForm, amount: event.target.value })}
                    aria-invalid={!!batchFieldErrors.amount}
                  />
                  {batchFieldErrors.amount && <p className="text-xs text-destructive">{batchFieldErrors.amount}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <DatePicker value={batchForm.dueDate} onChange={(value) => setBatchForm({ ...batchForm, dueDate: value })} />
                  {batchFieldErrors.dueDate && <p className="text-xs text-destructive">{batchFieldErrors.dueDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    value={batchForm.type}
                    onChange={(event) => setBatchForm({ ...batchForm, type: event.target.value })}
                    aria-invalid={!!batchFieldErrors.type}
                  />
                  {batchFieldErrors.type && <p className="text-xs text-destructive">{batchFieldErrors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Referência</Label>
                  <Input placeholder="2026-05" value={batchForm.referenceMonth} onChange={(event) => setBatchForm({ ...batchForm, referenceMonth: event.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || residents.length === 0}>Gerar lote</Button>
              </div>
            </form>
          </Card>
          </div>
        )}

        <Card className="p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Relatório financeiro</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(report?.summary?.total)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Pago</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(report?.summary?.paid)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(report?.summary?.pending)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Vencido</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(report?.summary?.overdue)}</p>
            </div>
          </div>
          {userRole === "admin" && report?.defaulters?.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-medium">Inadimplência</h3>
              <div className="space-y-2">
                {report.defaulters.slice(0, 8).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>{item.user?.name ?? "Morador"} - {new Date(item.dueDate).toLocaleDateString("pt-BR")}</span>
                    <span className="font-medium">{formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{userRole === "admin" ? "Cobranças" : "Minhas cobranças"}</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma cobrança registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {userRole === "admin" && <TableHead>Morador</TableHead>}
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    {userRole === "admin" && <TableCell>{payment.user?.name ?? "-"}</TableCell>}
                    <TableCell>{payment.type}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "success" : "warning"}>
                        {payment.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status !== "paid" && (
                        <Button size="sm" variant="outline" onClick={() => markPaid(payment.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Baixar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => showPix(payment.id)}>
                        Pix
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
