"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ApiError, apiRequest, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ContaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    async function loadAccount() {
      try {
        setUser((await apiRequest("/auth/me")) as User)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar sua conta")
      }
    }

    loadAccount()
  }, [])

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!currentPassword) errors.currentPassword = "Informe sua senha atual."
    if (newPassword.length < 6) errors.newPassword = "A nova senha deve ter pelo menos 6 caracteres."
    if (confirmPassword !== newPassword) errors.confirmPassword = "A confirmação precisa ser igual à nova senha."
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setFieldErrors({})
      toast({ title: "Senha alterada", variant: "success" })
    } catch (err) {
      toast({
        title: "Não foi possível alterar a senha",
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Minha conta</h1>
          <p className="text-sm md:text-base text-muted-foreground">Dados do perfil e segurança de acesso</p>
        </div>

        {error ? (
          <Card className="p-5 text-sm text-destructive">{error}</Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Perfil</h2>
                <p className="text-sm text-muted-foreground">Informações cadastradas pelo administrador</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email ?? "-"}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Apartamento</p>
                    <p className="font-medium">{user?.apartment ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Perfil</p>
                    <Badge variant="outline">{user?.role ?? "-"}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vagas</p>
                  <p className="font-medium">{user?.parkingSpaces?.length ? user.parkingSpaces.join(", ") : "-"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Alterar senha</h2>
                <p className="text-sm text-muted-foreground">Use uma senha com pelo menos 6 caracteres</p>
              </div>

              <form onSubmit={changePassword} noValidate className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    aria-invalid={!!fieldErrors.currentPassword}
                  />
                  {fieldErrors.currentPassword && <p className="text-xs text-destructive">{fieldErrors.currentPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    aria-invalid={!!fieldErrors.newPassword}
                  />
                  {fieldErrors.newPassword && <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    aria-invalid={!!fieldErrors.confirmPassword}
                  />
                  {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>{isSaving ? "Alterando..." : "Alterar senha"}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
