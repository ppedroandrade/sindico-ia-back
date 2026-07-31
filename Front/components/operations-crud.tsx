"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ApiError, apiRequest, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2 } from "lucide-react"
import { toLocalDateTimeInputValue } from "@/lib/date"

export type CrudField = {
  name: string
  label: string
  type?: "text" | "number" | "date" | "textarea" | "select" | "boolean"
  required?: boolean
  options?: Array<{ label: string; value: string }>
  source?: "users" | "units"
  /** Hidden from the create/edit form for non-admin roles (still shown to admin). */
  adminOnly?: boolean
}

type CrudAction = {
  label: string
  onClick: (item: any, refresh: () => Promise<void>) => Promise<void> | void
  /** Only rendered for admins (e.g. actions that call an admin-only endpoint). */
  adminOnly?: boolean
}

type OperationsCrudProps = {
  title: string
  description: string
  endpoint: string
  fields: CrudField[]
  columns: Array<{ key: string; label: string; render?: (item: any) => React.ReactNode }>
  adminOnlyCreate?: boolean
  actions?: CrudAction[]
  /** Client-side filter applied after fetching, e.g. to show only completed items. */
  filter?: (item: any) => boolean
  /** Hides the create form and edit/delete actions entirely, regardless of role. */
  readOnly?: boolean
}

const noneValue = "__none__"

export function OperationsCrud({
  title,
  description,
  endpoint,
  fields,
  columns,
  adminOnlyCreate = false,
  actions = [],
  filter,
  readOnly = false,
}: OperationsCrudProps) {
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const isAdmin = role === "admin"
  const visibleFields = useMemo(() => fields.filter((field) => isAdmin || !field.adminOnly), [fields, isAdmin])
  const canCreate = !readOnly && (!adminOnlyCreate || isAdmin)
  const canManageRows = !readOnly && isAdmin

  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const data = (await apiRequest(endpoint)) as any[]
      setItems(filter ? data.filter(filter) : data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os dados")
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "")
    loadData(true)

    async function loadSources() {
      try {
        if (fields.some((field) => field.source === "users")) {
          setUsers((await apiRequest("/users")) as User[])
        }
      } catch {
        setUsers([])
      }

      try {
        if (fields.some((field) => field.source === "units")) {
          setUnits((await apiRequest("/operations/units")) as any[])
        }
      } catch {
        setUnits([])
      }
    }

    loadSources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  const initialForm = useMemo(() => Object.fromEntries(visibleFields.map((field) => [field.name, ""])), [visibleFields])

  const buildPayload = () =>
    Object.fromEntries(
      Object.entries(form).map(([key, value]) => {
        const field = visibleFields.find((item) => item.name === key)
        if (value === noneValue) return [key, undefined]
        if (field?.type === "number") return [key, value === "" ? undefined : Number(value)]
        if (field?.type === "boolean") return [key, value === "true"]
        if (field?.type === "date") return [key, value ? new Date(value).toISOString() : undefined]
        return [key, value || undefined]
      }),
    )

  const validate = () => {
    const errors: Record<string, string> = {}
    for (const field of visibleFields) {
      if (field.required && !form[field.name]) {
        errors[field.name] = `Informe ${field.label.toLowerCase()}.`
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setIsSaving(true)
    try {
      const payload = buildPayload()

      const saved = await apiRequest(editingId ? `${endpoint}/${editingId}` : endpoint, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      })
      setItems((current) => editingId ? current.map((item) => (item.id === editingId ? saved : item)) : [saved, ...current])
      setForm(initialForm)
      setEditingId(null)
      setFieldErrors({})
      toast({ title: editingId ? "Registro atualizado" : "Registro salvo", variant: "success" })
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

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await apiRequest(`${endpoint}/${deleteTarget.id}`, { method: "DELETE" })
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id))
      toast({ title: "Registro excluído", variant: "success" })
    } catch (err) {
      toast({
        title: "Não foi possível excluir",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const startEdit = (item: any) => {
    const nextForm = Object.fromEntries(
      visibleFields.map((field) => {
        const value = item[field.name]
        if (field.type === "date" && value) return [field.name, toLocalDateTimeInputValue(value)]
        if (typeof value === "number") return [field.name, String(value)]
        if (typeof value === "boolean") return [field.name, String(value)]
        return [field.name, value ?? ""]
      }),
    )
    setForm(nextForm)
    setEditingId(item.id)
    setFieldErrors({})
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(initialForm)
    setFieldErrors({})
  }

  const renderInput = (field: CrudField) => {
    const invalid = !!fieldErrors[field.name]

    if (field.type === "textarea") {
      return (
        <Textarea
          value={form[field.name] ?? ""}
          onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
          aria-invalid={invalid}
        />
      )
    }

    if (field.type === "select" || field.source) {
      const options =
        field.source === "users"
          ? users.map((user) => ({ label: `${user.name} - ${user.email}`, value: user.id }))
          : field.source === "units"
            ? units.map((unit) => ({ label: `${unit.block ? `${unit.block}-` : ""}${unit.number}`, value: unit.id }))
            : field.options ?? []

      return (
        <Select value={form[field.name] || noneValue} onValueChange={(value) => setForm({ ...form, [field.name]: value })}>
          <SelectTrigger aria-invalid={invalid}>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={noneValue}>Nenhum</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        type={field.type === "date" ? "datetime-local" : field.type === "number" ? "number" : "text"}
        value={form[field.name] ?? ""}
        onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
        aria-invalid={invalid}
      />
    )
  }

  const showActionsColumn = !readOnly && (canManageRows || actions.some((action) => !action.adminOnly || isAdmin))

  return (
    <div className="space-y-6">
      {canCreate && (
        <Card className="p-5 md:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <form onSubmit={submit} noValidate className="grid gap-4 md:grid-cols-3">
            {visibleFields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "space-y-2 md:col-span-3" : "space-y-2"}>
                <Label>{field.label}</Label>
                {renderInput(field)}
                {fieldErrors[field.name] && <p className="text-xs text-destructive">{fieldErrors[field.name]}</p>}
              </div>
            ))}
            <div className="flex items-end md:col-span-3">
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-5 md:p-6">
        {!canCreate && (
          <div className="mb-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  {columns.map((column) => (
                    <th key={column.key} className="py-3 pr-4 font-medium">{column.label}</th>
                  ))}
                  {showActionsColumn && <th className="py-3 text-right font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    {columns.map((column) => (
                      <td key={column.key} className="py-3 pr-4">
                        {column.render ? column.render(item) : String(item[column.key] ?? "-")}
                      </td>
                    ))}
                    {showActionsColumn && (
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {actions
                            .filter((action) => !action.adminOnly || isAdmin)
                            .map((action) => (
                              <Button key={action.label} size="sm" variant="outline" onClick={() => action.onClick(item, () => loadData(false))}>
                                {action.label}
                              </Button>
                            ))}
                          {canManageRows && (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => startEdit(item)} aria-label="Editar">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(item)} aria-label="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function StatusBadge({ value }: { value?: string }) {
  return <Badge variant="outline">{value ?? "-"}</Badge>
}
