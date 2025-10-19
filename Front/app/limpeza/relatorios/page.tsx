"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Download, FileText, Filter, AlertTriangle, CheckCircle2, DollarSign, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CleaningReport {
  id: string
  date: string
  area: string
  responsible: string
  pendencies: string[]
  estimatedCost: number
  status: "completed" | "pending"
}

export default function RelatoriosLimpezaPage() {
  const { toast } = useToast()
  const [filterArea, setFilterArea] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>("10")

  const reports: CleaningReport[] = [
    {
      id: "1",
      date: "17/10/2025",
      area: "Salão de Festas",
      responsible: "Maria Santos",
      pendencies: ["2 cadeiras quebradas", "1 controle do ar"],
      estimatedCost: 420,
      status: "pending",
    },
    {
      id: "2",
      date: "17/10/2025",
      area: "Churrasqueira",
      responsible: "João Oliveira",
      pendencies: [],
      estimatedCost: 0,
      status: "completed",
    },
    {
      id: "3",
      date: "16/10/2025",
      area: "Playground",
      responsible: "Maria Santos",
      pendencies: [],
      estimatedCost: 0,
      status: "completed",
    },
    {
      id: "4",
      date: "15/10/2025",
      area: "Piscina",
      responsible: "Carlos Silva",
      pendencies: ["1 rede de proteção danificada"],
      estimatedCost: 350,
      status: "pending",
    },
    {
      id: "5",
      date: "14/10/2025",
      area: "Academia",
      responsible: "João Oliveira",
      pendencies: ["2 halteres faltando"],
      estimatedCost: 280,
      status: "pending",
    },
  ]

  const filteredReports = reports.filter((report) => {
    if (filterArea !== "all" && report.area !== filterArea) return false
    if (filterStatus !== "all" && report.status !== filterStatus) return false
    return true
  })

  const totalCost = filteredReports.reduce((sum, report) => sum + report.estimatedCost, 0)
  const pendingCount = filteredReports.filter((r) => r.status === "pending").length
  const completedCount = filteredReports.filter((r) => r.status === "completed").length

  const costByArea = [
    { name: "Salão de Festas", value: 420 },
    { name: "Piscina", value: 350 },
    { name: "Academia", value: 280 },
    { name: "Churrasqueira", value: 0 },
    { name: "Playground", value: 0 },
  ]

  const statusData = [
    { name: "Concluídas", value: completedCount, color: "#10b981" },
    { name: "Pendentes", value: pendingCount, color: "#ef4444" },
  ]

  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Seu relatório está sendo gerado...",
    })
  }

  const handleExportCSV = () => {
    toast({
      title: "Exportando CSV",
      description: "Seu arquivo está sendo baixado...",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Relatórios de Limpeza</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Acompanhe custos, pendências e status de todas as áreas
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total de Limpezas</p>
                <p className="text-xl sm:text-2xl font-bold">{filteredReports.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Concluídas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-500">{completedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pendências</p>
                <p className="text-xl sm:text-2xl font-bold text-red-500">{pendingCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Custo Total</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-500">R$ {totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Área</Label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  <SelectItem value="Salão de Festas">Salão de Festas</SelectItem>
                  <SelectItem value="Churrasqueira">Churrasqueira</SelectItem>
                  <SelectItem value="Piscina">Piscina</SelectItem>
                  <SelectItem value="Academia">Academia</SelectItem>
                  <SelectItem value="Playground">Playground</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Outubro 2025</SelectItem>
                  <SelectItem value="09">Setembro 2025</SelectItem>
                  <SelectItem value="08">Agosto 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Custos por Área</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Status das Limpezas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Table */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Histórico Detalhado</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Data</TableHead>
                  <TableHead className="min-w-[150px]">Área</TableHead>
                  <TableHead className="min-w-[150px]">Responsável</TableHead>
                  <TableHead className="min-w-[200px]">Pendências</TableHead>
                  <TableHead className="min-w-[120px]">Custo</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="text-xs sm:text-sm">{report.date}</TableCell>
                    <TableCell className="text-xs sm:text-sm font-medium">{report.area}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{report.responsible}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {report.pendencies.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {report.pendencies.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">Nenhuma</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {report.estimatedCost > 0 ? (
                        <span className="text-red-500 font-medium">R$ {report.estimatedCost.toFixed(2)}</span>
                      ) : (
                        <span className="text-green-500">R$ 0,00</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === "completed" ? "default" : "destructive"} className="text-xs">
                        {report.status === "completed" ? "Concluído" : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
