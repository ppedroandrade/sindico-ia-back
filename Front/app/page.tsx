"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewStats } from "@/components/overview-stats"
import { RecentActivity } from "@/components/recent-activity"
import { FinancialSummary } from "@/components/financial-summary"
import { QuickActions } from "@/components/quick-actions"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole === "morador") {
      router.push("/avisos")
    }
  }, [router])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resumo Geral</h1>
          <p className="text-sm md:text-base text-muted-foreground">Visão geral do condomínio e métricas principais</p>
        </div>

        <OverviewStats />

        <div className="grid gap-6 lg:grid-cols-2">
          <FinancialSummary />
          <RecentActivity />
        </div>

        <QuickActions />
      </div>
    </DashboardLayout>
  )
}
