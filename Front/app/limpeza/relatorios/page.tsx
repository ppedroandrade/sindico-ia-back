"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud, StatusBadge } from "@/components/operations-crud"

export default function RelatoriosLimpezaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios de Limpeza</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão consolidada das solicitações registradas pela equipe de limpeza
          </p>
        </div>

        <OperationsCrud
          title="Solicitações registradas"
          description="Somente leitura — para editar, use a tela de Manutenção"
          endpoint="/operations/maintenance"
          readOnly
          fields={[]}
          columns={[
            { key: "title", label: "Título" },
            { key: "category", label: "Categoria" },
            { key: "location", label: "Local" },
            { key: "requester", label: "Solicitante", render: (item) => item.requester?.name ?? "-" },
            { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
            {
              key: "createdAt",
              label: "Criada em",
              render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "-"),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  )
}
