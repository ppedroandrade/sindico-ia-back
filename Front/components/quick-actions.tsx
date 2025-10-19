import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Send, Calendar, MessageSquare, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Enviar Comunicado",
      description: "Notificar todos os moradores",
      icon: Send,
      href: "/configuracoes",
      color: "primary",
    },
    {
      title: "Nova Reserva",
      description: "Agendar área comum",
      icon: Calendar,
      href: "/reservas",
      color: "accent",
    },
    {
      title: "Gerar Relatório",
      description: "Exportar dados financeiros",
      icon: FileText,
      href: "/financeiro",
      color: "primary",
    },
    {
      title: "Ver Chatbot",
      description: "Histórico de conversas",
      icon: MessageSquare,
      href: "/chatbot",
      color: "accent",
    },
    {
      title: "Configurações",
      description: "Ajustar preferências",
      icon: Settings,
      href: "/configuracoes",
      color: "primary",
    },
    {
      title: "Análise Financeira",
      description: "Visualizar tendências",
      icon: TrendingUp,
      href: "/financeiro",
      color: "accent",
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Ações Rápidas</h3>
          <p className="text-sm text-muted-foreground">Acesso rápido às funcionalidades principais</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex items-start gap-3 hover:bg-muted bg-transparent"
                >
                  <div
                    className={`h-10 w-10 rounded-lg ${action.color === "primary" ? "bg-primary/10" : "bg-accent/10"} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${action.color === "primary" ? "text-primary" : "text-accent"}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
