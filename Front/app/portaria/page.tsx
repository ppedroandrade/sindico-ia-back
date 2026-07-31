"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud, StatusBadge } from "@/components/operations-crud"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiRequest } from "@/lib/api"

export default function PortariaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Portaria</h1>
          <p className="text-sm md:text-base text-muted-foreground">Visitantes, prestadores e encomendas</p>
        </div>

        <Tabs defaultValue="visitors">
          <TabsList>
            <TabsTrigger value="visitors">Acessos</TabsTrigger>
            <TabsTrigger value="packages">Encomendas</TabsTrigger>
          </TabsList>

          <TabsContent value="visitors">
            <OperationsCrud
              title="Acessos e visitantes"
              description="Autorizações e registro de entrada"
              endpoint="/operations/visitors"
              fields={[
                { name: "unitId", label: "Unidade", source: "units", adminOnly: true },
                { name: "residentId", label: "Morador responsável", source: "users", adminOnly: true },
                { name: "visitorName", label: "Nome", required: true },
                { name: "document", label: "Documento" },
                { name: "phone", label: "Telefone" },
                { name: "company", label: "Empresa" },
                { name: "purpose", label: "Motivo" },
                { name: "expectedAt", label: "Previsão", type: "date" },
                { name: "notes", label: "Observações", type: "textarea" },
              ]}
              columns={[
                { key: "visitorName", label: "Visitante" },
                { key: "unit", label: "Unidade", render: (item) => item.unit ? `${item.unit.block ? `${item.unit.block}-` : ""}${item.unit.number}` : "-" },
                { key: "resident", label: "Responsável", render: (item) => item.resident?.name ?? "-" },
                { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
                { key: "expectedAt", label: "Previsão", render: (item) => item.expectedAt ? new Date(item.expectedAt).toLocaleString("pt-BR") : "-" },
              ]}
              actions={[
                {
                  label: "Entrada",
                  adminOnly: true,
                  onClick: async (item, refresh) => {
                    await apiRequest(`/operations/visitors/${item.id}/status`, {
                      method: "PATCH",
                      body: JSON.stringify({ status: "checked_in" }),
                    })
                    await refresh()
                  },
                },
                {
                  label: "Saída",
                  adminOnly: true,
                  onClick: async (item, refresh) => {
                    await apiRequest(`/operations/visitors/${item.id}/status`, {
                      method: "PATCH",
                      body: JSON.stringify({ status: "checked_out" }),
                    })
                    await refresh()
                  },
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="packages">
            <OperationsCrud
              title="Encomendas"
              description="Registro de recebimento e retirada"
              endpoint="/operations/packages"
              adminOnlyCreate
              fields={[
                { name: "unitId", label: "Unidade", source: "units" },
                { name: "recipientName", label: "Destinatário", required: true },
                { name: "carrier", label: "Transportadora" },
                { name: "trackingCode", label: "Código de rastreio" },
                { name: "status", label: "Status", type: "select", options: [
                  { label: "Recebida", value: "received" },
                  { label: "Notificada", value: "notified" },
                  { label: "Entregue", value: "delivered" },
                  { label: "Devolvida", value: "returned" },
                ] },
                { name: "notes", label: "Observações", type: "textarea" },
              ]}
              columns={[
                { key: "recipientName", label: "Destinatário" },
                { key: "unit", label: "Unidade", render: (item) => item.unit ? `${item.unit.block ? `${item.unit.block}-` : ""}${item.unit.number}` : "-" },
                { key: "carrier", label: "Transportadora" },
                { key: "trackingCode", label: "Rastreio" },
                { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
