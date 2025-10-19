"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Settings } from "lucide-react"

export function IntegrationSettings() {
  const integrations = [
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Envio de mensagens e notificações via WhatsApp",
      status: "connected",
      icon: "💬",
    },
    {
      id: "email",
      name: "Servidor de E-mail",
      description: "Envio de comunicados e boletos por e-mail",
      status: "connected",
      icon: "📧",
    },
    {
      id: "payment",
      name: "Gateway de Pagamento",
      description: "Processamento de pagamentos online",
      status: "connected",
      icon: "💳",
    },
    {
      id: "sms",
      name: "SMS",
      description: "Envio de mensagens SMS para moradores",
      status: "disconnected",
      icon: "📱",
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Integrações</h3>
          <p className="text-sm text-muted-foreground">Gerencie as conexões com serviços externos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <div key={integration.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{integration.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{integration.name}</p>
                    {integration.status === "connected" ? (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                        <XCircle className="h-3 w-3 mr-1" />
                        Desconectado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                      <Settings className="h-3 w-3 mr-1" />
                      {integration.status === "connected" ? "Configurar" : "Conectar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
