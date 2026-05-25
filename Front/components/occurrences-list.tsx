"use client"

import { useEffect, useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { apiRequest } from "@/lib/api"

type Occurrence = {
  id: string
  title: string
}

export function OccurrencesList() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])

  useEffect(() => {
    async function loadOccurrences() {
      try {
        setOccurrences((await apiRequest("/occurrences")) as Occurrence[])
      } catch {
        setOccurrences([])
      }
    }

    loadOccurrences()
  }, [])

  if (occurrences.length === 0) {
    return <EmptyState title="Nenhuma ocorrência registrada" description="As ocorrências reais aparecerão aqui quando forem abertas." />
  }

  return (
    <div className="space-y-3">
      {occurrences.map((occurrence) => (
        <div key={occurrence.id} className="rounded-lg border p-4">
          <p className="font-medium">{occurrence.title}</p>
        </div>
      ))}
    </div>
  )
}
