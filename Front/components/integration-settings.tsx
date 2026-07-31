"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Construction, Settings, XCircle } from "lucide-react";

export function IntegrationSettings() {
  const integrations = [
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Envio de mensagens e notificações via WhatsApp",
    },
    {
      id: "email",
      name: "Servidor de E-mail",
      description: "Envio de comunicados e boletos por e-mail",
    },
    {
      id: "payment",
      name: "Gateway de Pagamento",
      description: "Processamento de pagamentos online",
    },
    {
      id: "sms",
      name: "SMS",
      description: "Envio de mensagens SMS para moradores",
    },
  ];

  return (
    <Card className="relative overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none space-y-6 blur-[3px] opacity-55"
      >
        <div>
          <h3 className="text-lg font-semibold">Integrações</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as conexões com serviços externos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <div key={integration.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{integration.name}</p>
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-border"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Desconectado
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs bg-transparent"
                      disabled
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Conectar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/35 p-5 backdrop-blur-[1px]">
        <div className="max-w-sm rounded-lg border bg-card px-6 py-5 text-center shadow-lg">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Construction className="h-5 w-5" />
          </div>
          <p className="font-semibold">Em desenvolvimento</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta funcionalidade estará disponível em uma próxima atualização.
          </p>
        </div>
      </div>
    </Card>
  );
}
