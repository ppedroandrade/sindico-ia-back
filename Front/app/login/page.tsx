"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Building2, Eye, EyeOff, Lock, Mail, TriangleAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiError, apiRequest, type User, type UserRole } from "@/lib/api"
import { consumePostLoginRedirect } from "@/lib/auth-redirect"

const roleRedirect: Record<UserRole, string> = {
  admin: "/",
  morador: "/avisos",
  limpeza: "/limpeza",
}

type FormAlert = {
  title: string
  description: string
  variant: "destructive" | "warning"
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<FormAlert | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const { reason } = consumePostLoginRedirect()
    if (reason === "session_expired") {
      setAlert({
        title: "Sessão expirada",
        description: "Sua sessão expirou. Faça login novamente para continuar.",
        variant: "warning",
      })
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!email.trim() || !password) {
      setAlert({
        title: "Preencha os campos",
        description: "Informe seu e-mail e sua senha para continuar.",
        variant: "warning",
      })
      return
    }

    setAlert(null)
    setIsLoading(true)

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      const { access_token: accessToken, user } = response as {
        access_token: string
        user?: User
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
        variant: "success",
      })

      const { path: redirectPath } = consumePostLoginRedirect()
      const destination = redirectPath ?? (user?.role ? roleRedirect[user.role] : "/")
      router.push(destination)
    } catch (error: unknown) {
      let title = "Não foi possível entrar"
      let description = "Não foi possível autenticar. Tente novamente."
      let variant: "destructive" | "warning" = "destructive"

      if (error instanceof ApiError) {
        if (error.status === 0) {
          title = "Falha de conexão"
          description = "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
        } else if (error.status === 401) {
          title = "Credenciais inválidas"
          description = "E-mail ou senha incorretos. Verifique os dados e tente novamente."
        } else if (error.status === 403) {
          title = "Conta desativada"
          description = error.message || "Esta conta foi desativada. Entre em contato com o síndico."
          variant = "warning"
        } else if (error.status === 429) {
          title = "Muitas tentativas"
          description = "Você tentou entrar várias vezes seguidas. Aguarde um instante antes de tentar novamente."
          variant = "warning"
        } else if (error.status >= 500) {
          title = "Erro interno do servidor"
          description = "Algo deu errado do nosso lado. Tente novamente em instantes."
        } else {
          description = error.message
        }
      } else {
        title = "Erro inesperado"
        description = "Ocorreu um erro inesperado. Tente novamente."
      }

      setAlert({ title, description, variant })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-sidebar px-14 py-12 text-sidebar-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sidebar-primary/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary">
            <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-semibold">Síndico de IA</span>
        </div>

        <div className="relative max-w-md space-y-6">
          <p className="font-heading text-4xl font-semibold leading-[1.15] text-balance">
            A administração do seu condomínio, organizada em um só lugar.
          </p>
          <p className="text-sidebar-foreground/70 text-base leading-relaxed">
            Financeiro, reservas, ocorrências e portaria acessíveis para síndico, moradores e equipe de limpeza —
            cada um com sua própria visão.
          </p>
          <dl className="grid grid-cols-3 gap-6 border-t border-sidebar-border pt-6 text-sm">
            <div>
              <dt className="font-heading text-2xl font-semibold text-sidebar-primary">3</dt>
              <dd className="text-sidebar-foreground/60">perfis de acesso</dd>
            </div>
            <div>
              <dt className="font-heading text-2xl font-semibold text-sidebar-primary">24/7</dt>
              <dd className="text-sidebar-foreground/60">portaria e avisos</dd>
            </div>
            <div>
              <dt className="font-heading text-2xl font-semibold text-sidebar-primary">1</dt>
              <dd className="text-sidebar-foreground/60">painel para tudo</dd>
            </div>
          </dl>
        </div>

        <p className="relative text-xs text-sidebar-foreground/50">
          &copy; {new Date().getFullYear()} Síndico de IA. Plataforma de automação condominial.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-semibold">Síndico de IA</h1>
            <p className="text-sm text-muted-foreground">Plataforma de automação condominial inteligente</p>
          </div>

          <div className="hidden space-y-1 lg:block">
            <h2 className="font-heading text-2xl font-semibold">Entrar na sua conta</h2>
            <p className="text-sm text-muted-foreground">Use o email ou usuário cadastrado pelo síndico.</p>
          </div>

          {alert && (
            <Alert variant={alert.variant}>
              <TriangleAlert />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
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
                  aria-invalid={!!alert}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  aria-invalid={!!alert}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-sm text-muted-foreground space-y-2 border-t pt-6">
            <p className="font-medium text-foreground">Use suas credenciais cadastradas</p>
            <p>
              Caso ainda não tenha acesso, solicite ao síndico ou utilize o cadastro do portal para criar
              um usuário.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
