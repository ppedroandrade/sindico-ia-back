"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DefaultersList() {
  const { toast } = useToast()

  const defaulters = [
    {
      id: 1,
      unit: "Apto 405",
      owner: "João Silva",
      amount: 1240.0,
      months: 3,
      lastContact: "2025-10-10",
      status: "critical",
    },
    {
      id: 2,
      unit: "Apto 201",
      owner: "Maria Santos",
      amount: 820.0,
      months: 2,
      lastContact: "2025-10-12",
      status: "warning",
    },
    {
      id: 3,
      unit: "Apto 308",
      owner: "Pedro Costa",
      amount: 410.0,
      months: 1,
      lastContact: "2025-10-14",
      status: "warning",
    },
    {
      id: 4,
      unit: "Apto 502",
      owner: "Ana Oliveira",
      amount: 1650.0,
      months: 4,
      lastContact: "2025-10-08",
      status: "critical",
    },
    {
      id: 5,
      unit: "Apto 103",
      owner: "Carlos Mendes",
      amount: 410.0,
      months: 1,
      lastContact: "2025-10-15",
      status: "warning",
    },
  ]

  const handleSendEmail = (unit: string, owner: string) => {
    toast({
      title: "Email enviado",
      description: `Lembrete de pagamento enviado para ${owner} (${unit})`,
    })
  }

  const handleCall = (unit: string, owner: string) => {
    toast({
      title: "Iniciando chamada",
      description: `Ligando para ${owner} (${unit})`,
    })
  }

  const handleSendAllReminders = () => {
    toast({
      title: "Lembretes enviados",
      description: `${defaulters.length} emails de cobrança foram enviados`,
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Inadimplentes</h3>
            <p className="text-sm text-muted-foreground">Unidades com pagamentos pendentes</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleSendAllReminders}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar Lembretes
          </Button>
        </div>

        <div className="space-y-3">
          {defaulters.map((defaulter) => (
            <div
              key={defaulter.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${defaulter.status === "critical" ? "bg-destructive/10" : "bg-destructive/5"}`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${defaulter.status === "critical" ? "text-destructive" : "text-destructive/70"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{defaulter.unit}</p>
                    <Badge
                      variant="outline"
                      className={
                        defaulter.status === "critical"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-destructive/5 text-destructive/70 border-destructive/10"
                      }
                    >
                      {defaulter.months} {defaulter.months === 1 ? "mês" : "meses"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{defaulter.owner}</p>
                  <p className="text-sm font-semibold mt-1">R$ {defaulter.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Último contato: {new Date(defaulter.lastContact).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleSendEmail(defaulter.unit, defaulter.owner)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleCall(defaulter.unit, defaulter.owner)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
