"use client"

import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EmptyState } from "@/components/empty-state"
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
          <p className="text-sm sm:text-base text-muted-foreground">Nenhuma área cadastrada para limpeza</p>
        </div>

        <EmptyState title="Nenhuma área de limpeza registrada" description="Cadastre áreas comuns para começar a operar a limpeza." />
      </div>
    </DashboardLayout>
  )
}
