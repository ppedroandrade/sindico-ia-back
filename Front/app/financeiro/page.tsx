"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PaymentOverview } from "@/components/payment-overview"
import { DefaultersList } from "@/components/defaulters-list"
import { PaymentHistory } from "@/components/payment-history"
import { FinancialCharts } from "@/components/financial-charts"
import { ResidentFinancial } from "@/components/resident-financial"
import { useEffect, useState } from "react"

export default function FinanceiroPage() {
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  return (
    <DashboardLayout>
      {userRole === "admin" ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gestão de pagamentos e inadimplência</p>
          </div>

          <PaymentOverview />

          <div className="grid gap-6 lg:grid-cols-2">
            <DefaultersList />
            <FinancialCharts />
          </div>

          <PaymentHistory />
        </div>
      ) : (
        <ResidentFinancial />
      )}
    </DashboardLayout>
  )
}
