"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ApiError, apiRequest, type AreaItem, type CommonArea } from "@/lib/api"
import { formatCurrency } from "@/lib/format"

export default function CommonAreasPage() {
  const { toast } = useToast()
  const [areas, setAreas] = useState<CommonArea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAreaDialog, setShowAreaDialog] = useState(false)
  const [showItemsDialog, setShowItemsDialog] = useState(false)
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null)
  const [editingArea, setEditingArea] = useState<Partial<CommonArea>>({})
  const [newItem, setNewItem] = useState<Partial<AreaItem>>({})

  const loadAreas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setAreas((await apiRequest("/common-areas")) as CommonArea[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as áreas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAreas()
  }, [])

  const handleCreateArea = () => {
    setEditingArea({ available: true })
    setShowAreaDialog(true)
  }

  const handleEditArea = (area: CommonArea) => {
    setEditingArea(area)
    setShowAreaDialog(true)
  }

  const handleSaveArea = async () => {
    if (!editingArea.name || !editingArea.capacity) {
      toast({ title: "Erro", description: "Preencha nome e capacidade", variant: "destructive" })
      return
    }

    const payload = {
      name: editingArea.name,
      description: editingArea.description,
      capacity: Number(editingArea.capacity),
      pricePerHour: Number(editingArea.pricePerHour ?? 0),
      available: editingArea.available ?? true,
    }

    const saved = (await apiRequest(editingArea.id ? `/common-areas/${editingArea.id}` : "/common-areas", {
      method: editingArea.id ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    })) as CommonArea

    setAreas((prev) => (editingArea.id ? prev.map((area) => (area.id === saved.id ? saved : area)) : [saved, ...prev]))
    setShowAreaDialog(false)
    setEditingArea({})
    toast({ title: editingArea.id ? "Área atualizada" : "Área criada" })
  }

  const handleDeleteArea = async (areaId: string) => {
    await apiRequest(`/common-areas/${areaId}`, { method: "DELETE" })
    setAreas((prev) => prev.filter((area) => area.id !== areaId))
    toast({ title: "Área removida" })
  }

  const handleManageItems = (area: CommonArea) => {
    setSelectedArea(area)
    setShowItemsDialog(true)
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.unitPrice || !selectedArea) {
      toast({ title: "Erro", description: "Preencha todos os campos do item", variant: "destructive" })
      return
    }

    const item = (await apiRequest(`/common-areas/${selectedArea.id}/items`, {
      method: "POST",
      body: JSON.stringify({
        name: newItem.name,
        quantity: Number(newItem.quantity),
        unitPrice: Number(newItem.unitPrice),
      }),
    })) as AreaItem

    const updatedArea = { ...selectedArea, items: [...selectedArea.items, item] }
    setSelectedArea(updatedArea)
    setAreas((prev) => prev.map((area) => (area.id === updatedArea.id ? updatedArea : area)))
    setNewItem({})
    toast({ title: "Item adicionado" })
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedArea) return
    await apiRequest(`/common-areas/items/${itemId}`, { method: "DELETE" })
    const updatedArea = { ...selectedArea, items: selectedArea.items.filter((item) => item.id !== itemId) }
    setSelectedArea(updatedArea)
    setAreas((prev) => prev.map((area) => (area.id === updatedArea.id ? updatedArea : area)))
    toast({ title: "Item removido" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Áreas Comuns</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Cadastre áreas e seus itens para controle operacional
            </p>
          </div>
          <Button onClick={handleCreateArea}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>

        {isLoading && <Card className="p-6">Carregando áreas...</Card>}
        {error && (
          <Card className="space-y-4 p-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={loadAreas}>Tentar novamente</Button>
          </Card>
        )}

        {!isLoading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Card key={area.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{area.name}</h3>
                      <p className="text-sm text-muted-foreground">{area.capacity} pessoas</p>
                    </div>
                    <Badge variant={area.available ? "success" : "secondary"}>
                      {area.available ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor por hora:</span>
                      <span className="font-semibold">{formatCurrency(area.pricePerHour)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Itens cadastrados:</span>
                      <span className="font-semibold">{area.items.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleManageItems(area)}>
                      <Package className="h-4 w-4 mr-2" />
                      Itens
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditArea(area)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteArea(area.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showAreaDialog} onOpenChange={setShowAreaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingArea.id ? "Editar Área" : "Nova Área Comum"}</DialogTitle>
              <DialogDescription>Preencha as informações da área comum</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area-name">Nome da Área</Label>
                <Input
                  id="area-name"
                  value={editingArea.name || ""}
                  onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-capacity">Capacidade</Label>
                <Input
                  id="area-capacity"
                  type="number"
                  value={editingArea.capacity || ""}
                  onChange={(e) => setEditingArea({ ...editingArea, capacity: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-price">Valor por hora (R$)</Label>
                <Input
                  id="area-price"
                  type="number"
                  value={editingArea.pricePerHour || ""}
                  onChange={(e) => setEditingArea({ ...editingArea, pricePerHour: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAreaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveArea}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Itens - {selectedArea?.name}</DialogTitle>
              <DialogDescription>Gerencie os itens desta área comum</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-3">Adicionar Novo Item</h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input
                    className="sm:col-span-2"
                    placeholder="Nome do item"
                    value={newItem.name || ""}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={newItem.quantity || ""}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor unit."
                    value={newItem.unitPrice || ""}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                  />
                </div>
                <Button size="sm" className="mt-3" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </Card>

              {selectedArea && selectedArea.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedArea.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum item cadastrado ainda</p>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowItemsDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
