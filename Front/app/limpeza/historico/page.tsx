import { DashboardLayout } from "@/components/dashboard-layout"
import { EmptyState } from "@/components/empty-state"

export default function HistoricoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Histórico de Limpezas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Nenhum histórico registrado</p>
        </div>

        <EmptyState title="Nenhuma limpeza registrada" description="As limpezas concluídas aparecerão aqui." />
      </div>
    </DashboardLayout>
  )
}
