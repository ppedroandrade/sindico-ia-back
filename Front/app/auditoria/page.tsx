"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    async function loadLogs() {
      setLogs((await apiRequest("/operations/audit")) as any[])
    }
    loadLogs().catch(() => undefined)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Auditoria</h1>
          <p className="text-sm md:text-base text-muted-foreground">Histórico administrativo das ações registradas</p>
        </div>

        <Card className="p-5 md:p-6">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-sm font-medium">{log.entity}</span>
                      {log.user?.name && <span className="text-sm text-muted-foreground">por {log.user.name}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  {log.metadata && (
                    <pre className="mt-3 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(log.metadata, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
