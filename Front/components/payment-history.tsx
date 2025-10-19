"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function PaymentHistory() {
  const payments = [
    {
      id: 1,
      date: "2025-10-15",
      unit: "Apto 301",
      owner: "Roberto Lima",
      amount: 820.0,
      type: "Condomínio",
      status: "paid",
      method: "PIX",
    },
    {
      id: 2,
      date: "2025-10-15",
      unit: "Apto 205",
      owner: "Fernanda Souza",
      amount: 820.0,
      type: "Condomínio",
      status: "paid",
      method: "Boleto",
    },
    {
      id: 3,
      date: "2025-10-14",
      unit: "Apto 102",
      owner: "Lucas Martins",
      amount: 820.0,
      type: "Condomínio",
      status: "paid",
      method: "PIX",
    },
    {
      id: 4,
      date: "2025-10-14",
      unit: "Apto 407",
      owner: "Juliana Rocha",
      amount: 820.0,
      type: "Condomínio",
      status: "paid",
      method: "Débito Automático",
    },
    {
      id: 5,
      date: "2025-10-13",
      unit: "Apto 503",
      owner: "Ricardo Alves",
      amount: 820.0,
      type: "Condomínio",
      status: "paid",
      method: "PIX",
    },
    {
      id: 6,
      date: "2025-10-12",
      unit: "Apto 209",
      owner: "Patricia Gomes",
      amount: 410.0,
      type: "Fundo de Reserva",
      status: "paid",
      method: "Boleto",
    },
  ]

  const statusConfig = {
    paid: { label: "Pago", className: "bg-accent/10 text-accent border-accent/20" },
    pending: { label: "Pendente", className: "bg-destructive/10 text-destructive border-destructive/20" },
    overdue: { label: "Atrasado", className: "bg-destructive/20 text-destructive border-destructive/30" },
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base md:text-lg font-semibold">Histórico de Pagamentos</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Últimas transações registradas</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 w-full md:w-[200px]" />
            </div>
            <Button size="sm" variant="outline" className="shrink-0 bg-transparent">
              <Download className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Exportar</span>
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Unidade</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Proprietário</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Método</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-sm">{new Date(payment.date).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 text-sm font-medium">{payment.unit}</td>
                    <td className="p-3 text-sm">{payment.owner}</td>
                    <td className="p-3 text-sm">{payment.type}</td>
                    <td className="p-3 text-sm text-right font-semibold">R$ {payment.amount.toFixed(2)}</td>
                    <td className="p-3 text-sm">{payment.method}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="outline"
                        className={statusConfig[payment.status as keyof typeof statusConfig].className}
                      >
                        {statusConfig[payment.status as keyof typeof statusConfig].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{payment.unit}</p>
                    <p className="text-xs text-muted-foreground">{payment.owner}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusConfig[payment.status as keyof typeof statusConfig].className}
                  >
                    {statusConfig[payment.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <p className="font-medium">{new Date(payment.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{payment.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-semibold">R$ {payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Método:</span>
                    <p className="font-medium">{payment.method}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
