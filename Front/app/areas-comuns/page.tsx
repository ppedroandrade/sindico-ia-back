"use client"

import { useState } from "react"
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

interface AreaItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

interface CommonArea {
  id: string
  name: string
  capacity: string
  price: number
  available: boolean
  items: AreaItem[]
}

export default function CommonAreasPage() {
  const { toast } = useToast()
  const [areas, setAreas] = useState<CommonArea[]>([
    {
      id: "1",
      name: "Salão de Festas",
      capacity: "80 pessoas",
      price: 200,
      available: true,
      items: [
        { id: "1", name: "Mesas", quantity: 8, unitPrice: 250 },
        { id: "2", name: "Cadeiras", quantity: 40, unitPrice: 180 },
        { id: "3", name: "Copos", quantity: 20, unitPrice: 15 },
        { id: "4", name: "Freezer", quantity: 1, unitPrice: 2500 },
        { id: "5", name: "Controle do Ar", quantity: 1, unitPrice: 120 },
      ],
    },
    {
      id: "2",
      name: "Churrasqueira",
      capacity: "30 pessoas",
      price: 100,
      available: true,
      items: [
        { id: "1", name: "Mesas", quantity: 4, unitPrice: 250 },
        { id: "2", name: "Cadeiras", quantity: 16, unitPrice: 180 },
        { id: "3", name: "Grelha", quantity: 1, unitPrice: 800 },
      ],
    },
  ])

  const [showAreaDialog, setShowAreaDialog] = useState(false)
  const [showItemsDialog, setShowItemsDialog] = useState(false)
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null)
  const [editingArea, setEditingArea] = useState<Partial<CommonArea>>({})
  const [newItem, setNewItem] = useState<Partial<AreaItem>>({})

  const handleCreateArea = () => {
    setEditingArea({})
    setShowAreaDialog(true)
  }

  const handleEditArea = (area: CommonArea) => {
    setEditingArea(area)
    setShowAreaDialog(true)
  }

  const handleSaveArea = () => {
    if (!editingArea.name || !editingArea.capacity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (editingArea.id) {
      setAreas(areas.map((a) => (a.id === editingArea.id ? ({ ...a, ...editingArea } as CommonArea) : a)))
      toast({
        title: "Área atualizada",
        description: "As informações foram salvas com sucesso",
      })
    } else {
      const newArea: CommonArea = {
        id: Date.now().toString(),
        name: editingArea.name,
        capacity: editingArea.capacity,
        price: editingArea.price || 0,
        available: editingArea.available ?? true,
        items: [],
      }
      setAreas([...areas, newArea])
      toast({
        title: "Área criada",
        description: "Nova área comum cadastrada com sucesso",
      })
    }

    setShowAreaDialog(false)
    setEditingArea({})
  }

  const handleDeleteArea = (areaId: string) => {
    setAreas(areas.filter((a) => a.id !== areaId))
    toast({
      title: "Área removida",
      description: "A área foi excluída do sistema",
    })
  }

  const handleManageItems = (area: CommonArea) => {
    setSelectedArea(area)
    setShowItemsDialog(true)
  }

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unitPrice || !selectedArea) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do item",
        variant: "destructive",
      })
      return
    }

    const item: AreaItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
    }

    setAreas(areas.map((a) => (a.id === selectedArea.id ? { ...a, items: [...a.items, item] } : a)))

    setNewItem({})
    toast({
      title: "Item adicionado",
      description: "O item foi cadastrado na área",
    })
  }

  const handleDeleteItem = (itemId: string) => {
    if (!selectedArea) return

    setAreas(areas.map((a) => (a.id === selectedArea.id ? { ...a, items: a.items.filter((i) => i.id !== itemId) } : a)))

    toast({
      title: "Item removido",
      description: "O item foi excluído da área",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Áreas Comuns</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Cadastre áreas e seus itens para controle de limpeza
            </p>
          </div>
          <Button onClick={handleCreateArea}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <Card key={area.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{area.name}</h3>
                    <p className="text-sm text-muted-foreground">{area.capacity}</p>
                  </div>
                  <Badge variant={area.available ? "default" : "secondary"}>
                    {area.available ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor da reserva:</span>
                    <span className="font-semibold">R$ {area.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Itens cadastrados:</span>
                    <span className="font-semibold">{area.items.length}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleManageItems(area)}
                  >
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

        {/* Dialog for creating/editing area */}
        <Dialog open={showAreaDialog} onOpenChange={setShowAreaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingArea.id ? "Editar Área" : "Nova Área Comum"}</DialogTitle>
              <DialogDescription>Preencha as informações da área comum</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area-name">Nome da Área *</Label>
                <Input
                  id="area-name"
                  placeholder="Ex: Salão de Festas"
                  value={editingArea.name || ""}
                  onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-capacity">Capacidade *</Label>
                <Input
                  id="area-capacity"
                  placeholder="Ex: 80 pessoas"
                  value={editingArea.capacity || ""}
                  onChange={(e) => setEditingArea({ ...editingArea, capacity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-price">Valor da Reserva (R$)</Label>
                <Input
                  id="area-price"
                  type="number"
                  placeholder="0.00"
                  value={editingArea.price || ""}
                  onChange={(e) => setEditingArea({ ...editingArea, price: Number.parseFloat(e.target.value) || 0 })}
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

        {/* Dialog for managing items */}
        <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Itens - {selectedArea?.name}</DialogTitle>
              <DialogDescription>Gerencie os itens desta área comum</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Add new item form */}
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-3">Adicionar Novo Item</h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Nome do item"
                      value={newItem.name || ""}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Quantidade"
                      value={newItem.quantity || ""}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Valor unit."
                      value={newItem.unitPrice || ""}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button size="sm" className="mt-3" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </Card>

              {/* Items list */}
              <div>
                <h4 className="font-semibold mb-3">Itens Cadastrados</h4>
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
                          <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
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
