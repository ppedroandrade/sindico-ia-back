"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ApiError, apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function GeneralSettings() {
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
    totalUnits: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadSettings() {
      const settings = (await apiRequest("/operations/settings")) as any
      setForm({
        name: settings.name ?? "",
        cnpj: settings.cnpj ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        totalUnits: settings.totalUnits ? String(settings.totalUnits) : "",
      })
    }

    loadSettings().catch(() => undefined)
  }, [])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await apiRequest("/operations/settings", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          totalUnits: form.totalUnits ? Number(form.totalUnits) : undefined,
        }),
      })
      toast({ title: "Configurações salvas" })
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-5 md:p-6">
      <form onSubmit={save} className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold">Informações gerais</h3>
          <p className="text-sm text-muted-foreground">Dados persistidos no backend</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome do condomínio</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input value={form.cnpj} onChange={(event) => setForm({ ...form, cnpj: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Total de unidades</Label>
            <Input type="number" value={form.totalUnits} onChange={(event) => setForm({ ...form, totalUnits: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Email</Label>
            <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Endereço completo</Label>
          <Textarea rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar configurações"}</Button>
        </div>
      </form>
    </Card>
  )
}
