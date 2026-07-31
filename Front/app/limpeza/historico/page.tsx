"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud, StatusBadge } from "@/components/operations-crud"

export default function HistoricoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Histórico de Limpezas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Solicitações já concluídas</p>
        </div>

        <OperationsCrud
          title="Concluídas"
          description="Ordens de serviço finalizadas"
          endpoint="/operations/maintenance"
          readOnly
          filter={(item) => item.status === "completed"}
          fields={[]}
          columns={[
            { key: "title", label: "Título" },
            { key: "category", label: "Categoria" },
            { key: "location", label: "Local" },
            { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
            {
              key: "completedAt",
              label: "Concluída em",
              render: (item) => (item.completedAt ? new Date(item.completedAt).toLocaleDateString("pt-BR") : "-"),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  )
}
