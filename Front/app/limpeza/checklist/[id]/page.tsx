import { DashboardLayout } from "@/components/dashboard-layout"
import { EmptyState } from "@/components/empty-state"

export default function ChecklistPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Checklist de Limpeza</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Nenhum checklist cadastrado</p>
        </div>

        <EmptyState title="Checklist indisponível" description="Cadastre áreas e itens reais antes de iniciar a limpeza." />
      </div>
    </DashboardLayout>
  )
}
