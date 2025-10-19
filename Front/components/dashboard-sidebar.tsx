"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  AlertCircle,
  MessageSquare,
  Settings,
  Building2,
  LogOut,
  Bell,
  X,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

const adminNavigation = [
  {
    name: "Resumo Geral",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
  {
    name: "Reservas",
    href: "/reservas",
    icon: Calendar,
  },
  {
    name: "Áreas Comuns",
    href: "/areas-comuns",
    icon: Building2,
  },
  {
    name: "Ocorrências",
    href: "/ocorrencias",
    icon: AlertCircle,
  },
  {
    name: "Limpeza",
    href: "/limpeza/relatorios",
    icon: Sparkles,
  },
  {
    name: "Avisos",
    href: "/avisos",
    icon: Bell,
  },
  {
    name: "Chatbot / IA",
    href: "/chatbot",
    icon: MessageSquare,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
]

const moradorNavigation = [
  {
    name: "Minhas Finanças",
    href: "/financeiro",
    icon: DollarSign,
  },
  {
    name: "Solicitar Reserva",
    href: "/reservas",
    icon: Calendar,
  },
  {
    name: "Avisos",
    href: "/avisos",
    icon: Bell,
  },
  {
    name: "Chatbot / IA",
    href: "/chatbot",
    icon: MessageSquare,
  },
]

const limpezaNavigation = [
  {
    name: "Áreas de Limpeza",
    href: "/limpeza",
    icon: Sparkles,
  },
  {
    name: "Histórico",
    href: "/limpeza/historico",
    icon: Calendar,
  },
]

interface DashboardSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [userUnit, setUserUnit] = useState<string>("")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUserName(localStorage.getItem("userName") || "")
    setUserEmail(localStorage.getItem("userEmail") || "")
    setUserUnit(localStorage.getItem("userUnit") || "")
  }, [])

  const navigation =
    userRole === "admin" ? adminNavigation : userRole === "limpeza" ? limpezaNavigation : moradorNavigation

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userUnit")
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    })
    router.push("/login")
  }

  const getUserInitials = () => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-sidebar-foreground truncate">Síndico de IA</h1>
              <p className="text-xs text-muted-foreground truncate">
                {userRole === "admin"
                  ? "Automação Condominial"
                  : userRole === "limpeza"
                    ? "Limpeza"
                    : "Portal do Morador"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userUnit ? `${userUnit} • ${userEmail}` : userEmail}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
