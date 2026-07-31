"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { ApiError, apiRequest, type User, type UserRole } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, UserPlus } from "lucide-react"

type FormData = {
  email: string
  username: string
  password: string
  name: string
  cpf: string
  apartment: string
  parkingSpaces: string[]
}

const initialFormData: FormData = {
  email: "",
  username: "",
  password: "",
  name: "",
  cpf: "",
  apartment: "",
  parkingSpaces: [""],
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setUsers((await apiRequest("/users")) as User[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar usuários")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const setParkingSpace = (index: number, value: string) => {
    setFormData((current) => ({
      ...current,
      parkingSpaces: current.parkingSpaces.map((space, itemIndex) => (itemIndex === index ? value : space)),
    }))
  }

  const addParkingSpace = () => {
    setFormData((current) => ({
      ...current,
      parkingSpaces: [...current.parkingSpaces, ""],
    }))
  }

  const removeParkingSpace = (index: number) => {
    setFormData((current) => ({
      ...current,
      parkingSpaces:
        current.parkingSpaces.length === 1
          ? [""]
          : current.parkingSpaces.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = "Informe o nome completo."
    if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ""))) errors.cpf = "Informe um CPF válido com 11 dígitos."
    if (!formData.email.trim() || !formData.email.includes("@")) errors.email = "Informe um e-mail válido."
    if (formData.password.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres."
    if (!formData.apartment.trim()) errors.apartment = "Informe o número do apartamento."
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setIsSaving(true)

    try {
      const payload = {
        email: formData.email.trim(),
        username: formData.username.trim() || undefined,
        password: formData.password,
        name: formData.name.trim(),
        cpf: formData.cpf.replace(/\D/g, "") || undefined,
        apartment: formData.apartment.trim() || undefined,
        parkingSpaces: formData.parkingSpaces.map((space) => space.trim()).filter(Boolean),
        role: "morador" satisfies UserRole,
      }

      const created = (await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      })) as User

      setUsers((current) => [created, ...current])
      setFormData(initialFormData)
      setFieldErrors({})
      toast({
        title: "Morador criado",
        description: "A conta foi criada com sucesso.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Erro ao criar morador",
        description: err instanceof ApiError ? err.message : "Não foi possível criar a conta.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const residents = users.filter((user) => user.role === "morador")

  const setUserActive = async (userId: string, active: boolean) => {
    try {
      const updated = (await apiRequest(`/users/${userId}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      })) as User
      setUsers((current) => current.map((user) => (user.id === userId ? updated : user)))
      toast({
        title: active ? "Morador ativado" : "Morador desativado",
        description: `A conta foi ${active ? "ativada" : "desativada"} com sucesso.`,
      })
    } catch (err) {
      toast({
        title: "Erro ao atualizar status",
        description: err instanceof ApiError ? err.message : "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteUser = async () => {
    if (!deleteTargetId) return
    const userId = deleteTargetId
    setDeletingId(userId)
    try {
      await apiRequest(`/users/${userId}`, { method: "DELETE" })
      setUsers((current) => current.filter((user) => user.id !== userId))
      toast({
        title: "Usuário excluído",
        description: "A conta foi removida com sucesso.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Não foi possível excluir",
        description:
          err instanceof ApiError
            ? err.message
            : "Ocorreu um erro ao excluir o usuário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setDeleteTargetId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm md:text-base text-muted-foreground">Crie contas de acesso para moradores</p>
        </div>

        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Novo Morador</h2>
                <p className="text-sm text-muted-foreground">Preencha os dados da conta e da unidade</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  inputMode="numeric"
                  maxLength={14}
                  value={formData.cpf}
                  onChange={(event) => setFormData({ ...formData, cpf: event.target.value })}
                  aria-invalid={!!fieldErrors.cpf}
                />
                {fieldErrors.cpf && <p className="text-xs text-destructive">{fieldErrors.cpf}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">Número do apartamento</Label>
                <Input
                  id="apartment"
                  value={formData.apartment}
                  onChange={(event) => setFormData({ ...formData, apartment: event.target.value })}
                  aria-invalid={!!fieldErrors.apartment}
                />
                {fieldErrors.apartment && <p className="text-xs text-destructive">{fieldErrors.apartment}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Vagas de carro</Label>
                <Button type="button" variant="outline" size="sm" onClick={addParkingSpace}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar vaga
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {formData.parkingSpaces.map((space, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={space}
                      onChange={(event) => setParkingSpace(index, event.target.value)}
                      placeholder={`Vaga ${index + 1}`}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeParkingSpace(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Criando..." : "Criar morador"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Moradores cadastrados</h2>
            <p className="text-sm text-muted-foreground">Contas criadas no banco de dados</p>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando moradores...</p>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={loadUsers}>
                Tentar novamente
              </Button>
            </div>
          ) : residents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum morador cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email/username</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Apto</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{resident.email}</p>
                        {resident.username && <p className="text-xs text-muted-foreground">{resident.username}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{resident.cpf ?? "-"}</TableCell>
                    <TableCell>{resident.apartment ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resident.parkingSpaces?.length ? (
                          resident.parkingSpaces.map((space) => (
                            <Badge key={space} variant="outline">
                              {space}
                            </Badge>
                          ))
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={resident.active === false ? "secondary" : "success"}>
                        {resident.active === false ? "Inativo" : "Ativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUserActive(resident.id, resident.active === false)}
                        >
                          {resident.active === false ? "Ativar" : "Desativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTargetId(resident.id)}
                          disabled={deletingId === resident.id}
                        >
                          {deletingId === resident.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                confirmDeleteUser()
              }}
              disabled={!!deletingId}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingId ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
