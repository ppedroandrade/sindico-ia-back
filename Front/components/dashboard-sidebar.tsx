"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  AlertCircle,
  MessageSquare,
  Settings,
  Building2,
  UserPlus,
  LogOut,
  Bell,
  X,
  Sparkles,
  UserCog,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  Vote,
  ShieldCheck,
  BarChart3,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

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
    name: "Estrutura",
    href: "/estrutura",
    icon: Building2,
  },
  {
    name: "Portaria",
    href: "/portaria",
    icon: ShieldCheck,
  },
  {
    name: "Usuários",
    href: "/usuarios",
    icon: UserPlus,
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
    name: "Manutenção",
    href: "/manutencao",
    icon: Wrench,
  },
  {
    name: "Assembleias",
    href: "/assembleias",
    icon: Vote,
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
  {
    name: "Auditoria",
    href: "/auditoria",
    icon: History,
  },
  {
    name: "Chatbot / IA",
    href: "/chatbot",
    icon: MessageSquare,
  },
  {
    name: "Minha Conta",
    href: "/conta",
    icon: UserCog,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

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
    name: "Ocorrências",
    href: "/ocorrencias",
    icon: AlertCircle,
  },
  {
    name: "Portaria",
    href: "/portaria",
    icon: ShieldCheck,
  },
  {
    name: "Manutenção",
    href: "/manutencao",
    icon: Wrench,
  },
  {
    name: "Assembleias",
    href: "/assembleias",
    icon: Vote,
  },
  {
    name: "Chatbot / IA",
    href: "/chatbot",
    icon: MessageSquare,
  },
  {
    name: "Minha Conta",
    href: "/conta",
    icon: UserCog,
  },
];

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
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DashboardSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userUnit, setUserUnit] = useState<string>("");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "");
    setUserName(localStorage.getItem("userName") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setUserUnit(localStorage.getItem("userUnit") || "");
  }, []);

  const navigation =
    userRole === "admin"
      ? adminNavigation
      : userRole === "limpeza"
        ? limpezaNavigation
        : moradorNavigation;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUnit");
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    router.push("/login");
  };

  const getUserInitials = () => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:translate-x-0",
          isCollapsed ? "w-20" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div
            className={cn(
              "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4",
              !isCollapsed && "lg:px-5",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className={cn("flex-1 min-w-0", isCollapsed && "hidden")}>
              <h1 className="font-heading text-base font-semibold leading-tight text-sidebar-foreground truncate">
                Síndico de IA
              </h1>
              <p className="text-xs text-sidebar-foreground/55 truncate">
                {userRole === "admin"
                  ? "Automação Condominial"
                  : userRole === "limpeza"
                    ? "Limpeza"
                    : "Portal do Morador"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex",
                isCollapsed && "mx-auto",
              )}
              onClick={onToggleCollapse}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
              <span className="sr-only">Alternar menu lateral</span>
            </Button>
          </div>

          {/* Navigation */}
          <div className="relative min-h-0 flex-1">
            <nav className="h-full space-y-1 overflow-y-auto p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isCollapsed && "justify-center px-2",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn("truncate", isCollapsed && "hidden")}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-sidebar to-transparent"
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-sidebar-border p-4 space-y-3">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg bg-sidebar-accent p-3",
                isCollapsed && "justify-center p-2",
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className={cn("flex-1 min-w-0", isCollapsed && "hidden")}>
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-sidebar-foreground/55 truncate">
                  {userUnit ? `${userUnit} • ${userEmail}` : userEmail}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-2",
              )}
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className={cn(isCollapsed && "hidden")}>Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
