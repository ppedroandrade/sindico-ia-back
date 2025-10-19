"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, Lock, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiError, apiRequest } from "@/lib/api"

type UserRole = "admin" | "morador" | "limpeza"

const roleRedirect: Record<UserRole, string> = {
  admin: "/",
  morador: "/avisos",
  limpeza: "/limpeza",
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      const { access_token: accessToken, user } = response as {
        access_token: string
        user?: {
          id: string
          name?: string | null
          email: string
          role: UserRole
          apartment?: string | null
        }
      }

      localStorage.setItem("token", accessToken)
      localStorage.setItem("isAuthenticated", "true")

      if (user) {
        localStorage.setItem("userEmail", user.email)
        localStorage.setItem("userRole", user.role)
        localStorage.setItem("userName", user.name ?? "")
        if (user.apartment) {
          localStorage.setItem("userUnit", user.apartment)
        } else {
          localStorage.removeItem("userUnit")
        }
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Síndico de IA",
      })

      if (user?.role) {
        router.push(roleRedirect[user.role])
      } else {
        router.push("/")
      }
    } catch (error: unknown) {
      let title = "Erro ao fazer login"
      let description = "Não foi possível autenticar"
      let variant: "default" | "destructive" = "destructive"

      if (error instanceof ApiError) {
        if (error.status === 0) {
          description = "Sistema indisponível no momento. Verifique sua conexão ou tente mais tarde."
        } else if (error.status === 401 || error.status === 403) {
          description = "Credenciais inválidas. Verifique seu email e senha."
        } else {
          description = error.message
        }
      } else if (error instanceof Error) {
        description = error.message
      } else {
        description = "Ocorreu um erro inesperado."
      }

      toast({
        title,
        description,
        variant,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Síndico de IA</h1>
          <p className="text-sm text-muted-foreground">Plataforma de automação condominial inteligente</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Use suas credenciais cadastradas</p>
          <p>
            Caso ainda não tenha acesso, solicite ao síndico ou utilize o cadastro do portal para criar
            um usuário.
          </p>
        </div>
      </Card>
    </div>
  )
}
