import { DashboardLayout } from "@/components/dashboard-layout"
import { OccurrencesStats } from "@/components/occurrences-stats"
import { OccurrencesList } from "@/components/occurrences-list"
import { OccurrencesChart } from "@/components/occurrences-chart"

export default function OcorrenciasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ocorrências</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gestão de problemas e solicitações</p>
        </div>

        <OccurrencesStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OccurrencesList />
          </div>
          <div>
            <OccurrencesChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
