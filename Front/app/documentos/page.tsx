"use client"

import type React from "react"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud, StatusBadge } from "@/components/operations-crud"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function DocumentosPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const uploadFile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return
    setIsUploading(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/operations/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) throw new ApiError(payload.message ?? "Erro no upload", response.status, payload)
      setUploadedUrl(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}${payload.fileUrl}`)
      toast({ title: "Arquivo enviado" })
    } catch (err) {
      toast({
        title: "Upload falhou",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Regimento, convenção, atas, contratos e laudos</p>
        </div>

        <Card className="p-5 md:p-6">
          <form onSubmit={uploadFile} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Upload de arquivo</h2>
              <p className="text-sm text-muted-foreground">Envie o arquivo e use o link gerado no campo "Link do arquivo".</p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label>Arquivo</Label>
                <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" disabled={!file || isUploading}>{isUploading ? "Enviando..." : "Enviar arquivo"}</Button>
            </div>
            {uploadedUrl && (
              <div className="rounded-lg border bg-muted p-3 text-sm">
                <span className="font-medium">Link: </span>
                <a href={uploadedUrl} target="_blank" className="text-primary underline">{uploadedUrl}</a>
              </div>
            )}
          </form>
        </Card>

        <OperationsCrud
          title="Biblioteca de documentos"
          description="Cadastre links ou conteúdo textual para consulta dos moradores"
          endpoint="/operations/documents"
          adminOnlyCreate
          fields={[
            { name: "title", label: "Título", required: true },
            { name: "type", label: "Tipo", type: "select", options: [
              { label: "Regimento", value: "regulation" },
              { label: "Convenção", value: "convention" },
              { label: "Ata", value: "minutes" },
              { label: "Contrato", value: "contract" },
              { label: "Laudo", value: "report" },
              { label: "Manual", value: "manual" },
              { label: "Financeiro", value: "financial" },
              { label: "Outro", value: "other" },
            ] },
            { name: "fileUrl", label: "Link do arquivo" },
            { name: "description", label: "Descrição", type: "textarea" },
            { name: "content", label: "Conteúdo", type: "textarea" },
          ]}
          columns={[
            { key: "title", label: "Título" },
            { key: "type", label: "Tipo", render: (item) => <StatusBadge value={item.type} /> },
            { key: "description", label: "Descrição" },
            { key: "fileUrl", label: "Arquivo", render: (item) => item.fileUrl ? <a className="text-primary underline" href={item.fileUrl} target="_blank">Abrir</a> : "-" },
          ]}
        />
      </div>
    </DashboardLayout>
  )
}
