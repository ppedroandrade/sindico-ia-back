import { DashboardLayout } from "@/components/dashboard-layout"
import { EmptyState } from "@/components/empty-state"

export default function RelatoriosLimpezaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios de Limpeza</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Sem dados operacionais cadastrados</p>
        </div>

        <EmptyState title="Nenhum relatório disponível" description="Os relatórios serão gerados a partir de limpezas reais." />
      </div>
    </DashboardLayout>
  )
}
