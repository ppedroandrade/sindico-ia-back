"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud, StatusBadge } from "@/components/operations-crud"
import { formatCurrency } from "@/lib/format"

export default function ManutencaoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manutenção</h1>
          <p className="text-sm md:text-base text-muted-foreground">Ordens de serviço, prestadores e manutenções preventivas</p>
        </div>

        <OperationsCrud
          title="Ordens de serviço"
          description="Controle operacional de manutenção do condomínio"
          endpoint="/operations/maintenance"
          fields={[
            { name: "title", label: "Título", required: true },
            { name: "category", label: "Categoria", required: true },
            { name: "location", label: "Local" },
            { name: "vendor", label: "Prestador", adminOnly: true },
            { name: "estimatedCost", label: "Custo estimado", type: "number", adminOnly: true },
            { name: "scheduledAt", label: "Agendamento", type: "date" },
            { name: "description", label: "Descrição", type: "textarea", required: true },
          ]}
          columns={[
            { key: "title", label: "Título" },
            { key: "category", label: "Categoria" },
            { key: "location", label: "Local" },
            { key: "vendor", label: "Prestador" },
            { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
            { key: "estimatedCost", label: "Custo", render: (item) => item.estimatedCost ? formatCurrency(Number(item.estimatedCost)) : "-" },
          ]}
        />
      </div>
    </DashboardLayout>
  )
}
