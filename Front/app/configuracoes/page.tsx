import { DashboardLayout } from "@/components/dashboard-layout"
import { GeneralSettings } from "@/components/general-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { IntegrationSettings } from "@/components/integration-settings"

export default function ConfiguracoesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie as preferências do sistema</p>
        </div>

        <div className="grid gap-6">
          <GeneralSettings />
          <NotificationSettings />
          <IntegrationSettings />
        </div>
      </div>
    </DashboardLayout>
  )
}
