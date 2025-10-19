"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Area {
  id: string
  name: string
  status: "clean" | "in-progress" | "pending"
  lastCleaned: string
  assignedTo?: string
}

export default function LimpezaPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  const [areas] = useState<Area[]>([
    {
      id: "1",
      name: "Salão de Festas",
      status: "pending",
      lastCleaned: "16/10/2025",
      assignedTo: "Maria Santos",
    },
    {
      id: "2",
      name: "Churrasqueira",
      status: "clean",
      lastCleaned: "17/10/2025",
      assignedTo: "João Oliveira",
    },
    {
      id: "3",
      name: "Piscina",
      status: "in-progress",
      lastCleaned: "15/10/2025",
      assignedTo: "Maria Santos",
    },
    {
      id: "4",
      name: "Academia",
      status: "pending",
      lastCleaned: "14/10/2025",
      assignedTo: "Carlos Silva",
    },
    {
      id: "5",
      name: "Playground",
      status: "clean",
      lastCleaned: "17/10/2025",
      assignedTo: "Maria Santos",
    },
    {
      id: "6",
      name: "Salão de Jogos",
      status: "pending",
      lastCleaned: "13/10/2025",
      assignedTo: "João Oliveira",
    },
  ])

  const getStatusConfig = (status: Area["status"]) => {
    switch (status) {
      case "clean":
        return {
          label: "Limpo",
          variant: "default" as const,
          icon: CheckCircle2,
          color: "text-green-500",
        }
      case "in-progress":
        return {
          label: "Em andamento",
          variant: "secondary" as const,
          icon: Clock,
          color: "text-yellow-500",
        }
      case "pending":
        return {
          label: "Pendente",
          variant: "destructive" as const,
          icon: AlertCircle,
          color: "text-red-500",
        }
    }
  }

  const handleStartCleaning = (areaId: string) => {
    router.push(`/limpeza/checklist/${areaId}`)
  }

  useEffect(() => {
    if (userRole === "admin") {
      router.push("/limpeza/relatorios")
    }
  }, [userRole, router])

  // Show cleaning staff view
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Áreas de Limpeza</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Selecione uma área para iniciar a limpeza</p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => {
            const statusConfig = getStatusConfig(area.status)
            const StatusIcon = statusConfig.icon

            return (
              <Card key={area.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{area.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Última: {area.lastCleaned}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>

                  <Button className="w-full" size="lg" onClick={() => handleStartCleaning(area.id)}>
                    {area.status === "in-progress" ? "Continuar Limpeza" : "Iniciar Limpeza"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
