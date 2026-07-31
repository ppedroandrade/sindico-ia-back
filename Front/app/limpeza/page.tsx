"use client"

import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud, StatusBadge } from "@/components/operations-crud"
import { useCurrentUser } from "@/components/auth-context"
import { useRouter } from "next/navigation"

export default function LimpezaPage() {
  const router = useRouter()
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (currentUser?.role === "admin") {
      router.push("/limpeza/relatorios")
    }
  }, [currentUser, router])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Áreas de Limpeza</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Solicitações e ordens de serviço relacionadas à limpeza do condomínio
          </p>
        </div>

        <OperationsCrud
          title="Solicitações de limpeza"
          description="Registre uma nova solicitação ou acompanhe as existentes"
          endpoint="/operations/maintenance"
          fields={[
            { name: "title", label: "Título", required: true },
            { name: "category", label: "Categoria", required: true },
            { name: "location", label: "Local" },
            { name: "scheduledAt", label: "Agendamento", type: "date" },
            { name: "description", label: "Descrição", type: "textarea", required: true },
          ]}
          columns={[
            { key: "title", label: "Título" },
            { key: "category", label: "Categoria" },
            { key: "location", label: "Local" },
            { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
          ]}
        />
      </div>
    </DashboardLayout>
  )
}
