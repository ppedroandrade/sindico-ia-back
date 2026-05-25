"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function GeneralSettings() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    units: "",
    phone: "",
    address: "",
  })

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast({
        title: "Configurações salvas!",
        description: "As alterações foram aplicadas com sucesso.",
      })
      setIsSaving(false)
    }, 1000)
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      cnpj: "",
      units: "",
      phone: "",
      address: "",
    })
    toast({
      title: "Alterações descartadas",
      description: "Os valores foram restaurados.",
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Informações Gerais</h3>
          <p className="text-sm text-muted-foreground">Dados básicos do condomínio</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="condo-name">Nome do Condomínio</Label>
            <Input
              id="condo-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condo-cnpj">CNPJ</Label>
            <Input
              id="condo-cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condo-units">Total de Unidades</Label>
            <Input
              id="condo-units"
              type="number"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condo-phone">Telefone</Label>
            <Input
              id="condo-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condo-address">Endereço Completo</Label>
          <Textarea
            id="condo-address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
