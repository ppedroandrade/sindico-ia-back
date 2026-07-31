"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ApiError, apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/components/auth-context"
import { toLocalDateTimeInputValue } from "@/lib/date"

const statusOptions = ["draft", "scheduled", "open", "closed", "archived"]

export default function AssembleiasPage() {
  const currentUser = useCurrentUser()
  const role = currentUser?.role ?? ""
  const [assemblies, setAssemblies] = useState<any[]>([])
  const [form, setForm] = useState({ title: "", scheduledAt: "", location: "", status: "scheduled", description: "", agenda: "" })
  const [voteForm, setVoteForm] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadAssemblies = async () => {
    setAssemblies((await apiRequest("/operations/assemblies")) as any[])
  }

  useEffect(() => {
    loadAssemblies().catch(() => undefined)
  }, [])

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = "Informe o título da assembleia."
    if (!form.scheduledAt) errors.scheduledAt = "Selecione a data e o horário."
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveAssembly = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    try {
      const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }
      const saved = await apiRequest(editingId ? `/operations/assemblies/${editingId}` : "/operations/assemblies", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      })
      setAssemblies((current) => editingId ? current.map((item) => item.id === editingId ? saved : item) : [saved, ...current])
      setEditingId(null)
      setForm({ title: "", scheduledAt: "", location: "", status: "scheduled", description: "", agenda: "" })
      setFieldErrors({})
      toast({ title: "Assembleia salva", variant: "success" })
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err instanceof ApiError ? err.message : "Tente novamente.", variant: "destructive" })
    }
  }

  const startEdit = (assembly: any) => {
    setEditingId(assembly.id)
    setForm({
      title: assembly.title ?? "",
      scheduledAt: assembly.scheduledAt ? toLocalDateTimeInputValue(assembly.scheduledAt) : "",
      location: assembly.location ?? "",
      status: assembly.status ?? "scheduled",
      description: assembly.description ?? "",
      agenda: assembly.agenda ?? "",
    })
    setFieldErrors({})
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const vote = async (assemblyId: string, option: string) => {
    await apiRequest(`/operations/assemblies/${assemblyId}/votes`, {
      method: "POST",
      body: JSON.stringify({ option, comment: voteForm[assemblyId] }),
    })
    setVoteForm((current) => ({ ...current, [assemblyId]: "" }))
    await loadAssemblies()
    toast({ title: "Voto registrado" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assembleias</h1>
          <p className="text-sm md:text-base text-muted-foreground">Convocações, pautas e votação dos moradores</p>
        </div>

        {role === "admin" && (
          <Card className="p-5 md:p-6">
            <form onSubmit={saveAssembly} noValidate className="space-y-4">
              <h2 className="text-lg font-semibold">{editingId ? "Editar assembleia" : "Nova assembleia"}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    aria-invalid={!!fieldErrors.title}
                  />
                  {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Data e horário</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })}
                    aria-invalid={!!fieldErrors.scheduledAt}
                  />
                  {fieldErrors.scheduledAt && <p className="text-xs text-destructive">{fieldErrors.scheduledAt}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Local</Label>
                  <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Pauta</Label>
                  <Textarea value={form.agenda} onChange={(event) => setForm({ ...form, agenda: event.target.value })} />
                </div>
              </div>
              <Button type="submit">{editingId ? "Atualizar" : "Criar"}</Button>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {assemblies.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">Nenhuma assembleia cadastrada.</Card>
          ) : assemblies.map((assembly) => {
            const votes = assembly.votes ?? []
            const yes = votes.filter((voteItem: any) => voteItem.option === "sim").length
            const no = votes.filter((voteItem: any) => voteItem.option === "nao").length
            const abstain = votes.filter((voteItem: any) => voteItem.option === "abstencao").length
            return (
              <Card key={assembly.id} className="p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{assembly.title}</h2>
                      <Badge variant="outline">{assembly.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(assembly.scheduledAt).toLocaleString("pt-BR")} {assembly.location ? `- ${assembly.location}` : ""}
                    </p>
                    {assembly.description && <p className="mt-3 text-sm">{assembly.description}</p>}
                    {assembly.agenda && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{assembly.agenda}</p>}
                  </div>
                  {role === "admin" && <Button variant="outline" onClick={() => startEdit(assembly)}>Editar</Button>}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Sim</p><p className="text-xl font-semibold">{yes}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Não</p><p className="text-xl font-semibold">{no}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Abstenção</p><p className="text-xl font-semibold">{abstain}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-semibold">{votes.length}</p></div>
                </div>

                {role !== "admin" && assembly.status === "open" && (
                  <div className="mt-5 space-y-3">
                    <Textarea placeholder="Comentário opcional" value={voteForm[assembly.id] ?? ""} onChange={(event) => setVoteForm({ ...voteForm, [assembly.id]: event.target.value })} />
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => vote(assembly.id, "sim")}>Votar sim</Button>
                      <Button variant="outline" onClick={() => vote(assembly.id, "nao")}>Votar não</Button>
                      <Button variant="ghost" onClick={() => vote(assembly.id, "abstencao")}>Abster</Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
