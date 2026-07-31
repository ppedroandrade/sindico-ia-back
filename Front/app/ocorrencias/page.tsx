"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError, apiRequest, type Occurrence } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/components/auth-context"

const statusLabels: Record<Occurrence["status"], string> = {
  open: "Aberta",
  in_progress: "Em andamento",
  resolved: "Resolvida",
  cancelled: "Cancelada",
}

const statusBadgeVariant: Record<Occurrence["status"], "warning" | "default" | "success" | "secondary"> = {
  open: "warning",
  in_progress: "default",
  resolved: "success",
  cancelled: "secondary",
}

const priorityBadgeVariant: Record<Occurrence["priority"], "secondary" | "default" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "destructive",
}

const priorityLabels: Record<Occurrence["priority"], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
}

export default function OcorrenciasPage() {
  const currentUser = useCurrentUser()
  const userRole = currentUser?.role ?? ""
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "medium",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadOccurrences = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    setError(null)
    try {
      setOccurrences((await apiRequest("/occurrences")) as Occurrence[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar ocorrências")
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOccurrences(true)
    const interval = window.setInterval(() => loadOccurrences(false), 5000)
    return () => window.clearInterval(interval)
  }, [])

  const stats = useMemo(() => {
    return {
      open: occurrences.filter((item) => item.status === "open").length,
      inProgress: occurrences.filter((item) => item.status === "in_progress").length,
      resolved: occurrences.filter((item) => item.status === "resolved").length,
      total: occurrences.length,
    }
  }, [occurrences])

  const validate = () => {
    const errors: Record<string, string> = {}
    if (form.title.trim().length < 3) errors.title = "O título deve ter pelo menos 3 caracteres."
    if (!form.category.trim()) errors.category = "Informe a categoria."
    if (form.description.trim().length < 5) errors.description = "Descreva o problema com pelo menos 5 caracteres."
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setIsSaving(true)
    try {
      const created = (await apiRequest("/occurrences", {
        method: "POST",
        body: JSON.stringify(form),
      })) as Occurrence
      setOccurrences((current) => [created, ...current])
      setForm({ title: "", category: "", priority: "medium", description: "" })
      setFieldErrors({})
      toast({ title: "Ocorrência registrada", variant: "success" })
    } catch (err) {
      toast({
        title: "Erro ao registrar ocorrência",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateStatus = async (id: string, status: Occurrence["status"]) => {
    const updated = (await apiRequest(`/occurrences/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })) as Occurrence
    setOccurrences((current) => current.map((item) => (item.id === id ? updated : item)))
  }

  const loadComments = async (occurrenceId: string) => {
    const loaded = (await apiRequest(`/operations/occurrences/${occurrenceId}/comments`)) as any[]
    setComments((current) => ({ ...current, [occurrenceId]: loaded }))
  }

  const addComment = async (occurrenceId: string) => {
    const content = commentText[occurrenceId]?.trim()
    if (!content) return

    const created = await apiRequest(`/operations/occurrences/${occurrenceId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
    setComments((current) => ({ ...current, [occurrenceId]: [...(current[occurrenceId] ?? []), created] }))
    setCommentText((current) => ({ ...current, [occurrenceId]: "" }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ocorrências</h1>
          <p className="text-sm md:text-base text-muted-foreground">Registro e acompanhamento de solicitações</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-5"><p className="text-sm text-muted-foreground">Total</p><p className="mt-2 text-2xl font-semibold">{stats.total}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Abertas</p><p className="mt-2 text-2xl font-semibold">{stats.open}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Em andamento</p><p className="mt-2 text-2xl font-semibold">{stats.inProgress}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Resolvidas</p><p className="mt-2 text-2xl font-semibold">{stats.resolved}</p></Card>
        </div>

        <Card className="p-4 md:p-6">
          <form onSubmit={handleCreate} noValidate className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Nova ocorrência</h2>
              <p className="text-sm text-muted-foreground">Descreva o problema para registrar no histórico</p>
            </div>
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
                <Label>Categoria</Label>
                <Input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  aria-invalid={!!fieldErrors.category}
                />
                {fieldErrors.category && <p className="text-xs text-destructive">{fieldErrors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(priority) => setForm({ ...form, priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                aria-invalid={!!fieldErrors.description}
              />
              {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>{isSaving ? "Registrando..." : "Registrar ocorrência"}</Button>
            </div>
          </form>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Ocorrências registradas</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : occurrences.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>
          ) : (
            <div className="space-y-3">
              {occurrences.map((occurrence) => (
                <div key={occurrence.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{occurrence.title}</p>
                        <Badge variant={statusBadgeVariant[occurrence.status]}>{statusLabels[occurrence.status]}</Badge>
                        <Badge variant={priorityBadgeVariant[occurrence.priority]}>{priorityLabels[occurrence.priority]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{occurrence.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {occurrence.category} {occurrence.reporter?.apartment ? `- Apto ${occurrence.reporter.apartment}` : ""}
                      </p>
                    </div>
                    {userRole === "admin" && (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(occurrence.id, "in_progress")}>Andamento</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(occurrence.id, "resolved")}>Resolver</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(occurrence.id, "cancelled")}>Cancelar</Button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Comentários</p>
                      <Button size="sm" variant="ghost" onClick={() => loadComments(occurrence.id)}>
                        Atualizar
                      </Button>
                    </div>
                    {(comments[occurrence.id] ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum comentário carregado.</p>
                    ) : (
                      <div className="mb-3 space-y-2">
                        {(comments[occurrence.id] ?? []).map((comment) => (
                          <div key={comment.id} className="rounded-lg bg-muted p-3">
                            <p className="text-xs font-medium">{comment.author?.name ?? "Usuário"}</p>
                            <p className="mt-1 text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={commentText[occurrence.id] ?? ""}
                        onChange={(event) => setCommentText((current) => ({ ...current, [occurrence.id]: event.target.value }))}
                        placeholder="Adicionar comentário..."
                      />
                      <Button onClick={() => addComment(occurrence.id)}>Enviar</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
