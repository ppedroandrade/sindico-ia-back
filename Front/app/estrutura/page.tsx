"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsCrud } from "@/components/operations-crud"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EstruturaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estrutura</h1>
          <p className="text-sm md:text-base text-muted-foreground">Unidades, vagas, veículos e pets do condomínio</p>
        </div>

        <Tabs defaultValue="units">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="units">Unidades</TabsTrigger>
            <TabsTrigger value="parking">Vagas</TabsTrigger>
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
          </TabsList>

          <TabsContent value="units">
            <OperationsCrud
              title="Unidades"
              description="Cadastro real de apartamentos/unidades"
              endpoint="/operations/units"
              adminOnlyCreate
              fields={[
                { name: "block", label: "Bloco" },
                { name: "number", label: "Número", required: true },
                { name: "floor", label: "Andar" },
                { name: "fraction", label: "Fração ideal", type: "number" },
                { name: "ownerId", label: "Proprietário", source: "users" },
                { name: "notes", label: "Observações", type: "textarea" },
              ]}
              columns={[
                { key: "number", label: "Unidade", render: (item) => `${item.block ? `${item.block}-` : ""}${item.number}` },
                { key: "floor", label: "Andar" },
                { key: "owner", label: "Proprietário", render: (item) => item.owner?.name ?? "-" },
                { key: "parkingSpaces", label: "Vagas", render: (item) => item.parkingSpaces?.map((space: any) => space.code).join(", ") || "-" },
              ]}
            />
          </TabsContent>

          <TabsContent value="parking">
            <OperationsCrud
              title="Vagas"
              description="Controle de vagas vinculadas às unidades"
              endpoint="/operations/parking-spaces"
              adminOnlyCreate
              fields={[
                { name: "code", label: "Código", required: true },
                { name: "unitId", label: "Unidade", source: "units" },
                { name: "notes", label: "Observações", type: "textarea" },
              ]}
              columns={[
                { key: "code", label: "Vaga" },
                { key: "unit", label: "Unidade", render: (item) => item.unit ? `${item.unit.block ? `${item.unit.block}-` : ""}${item.unit.number}` : "-" },
                { key: "notes", label: "Observações" },
              ]}
            />
          </TabsContent>

          <TabsContent value="vehicles">
            <OperationsCrud
              title="Veículos"
              description="Cadastro de veículos dos moradores"
              endpoint="/operations/vehicles"
              fields={[
                { name: "userId", label: "Morador", source: "users" },
                { name: "plate", label: "Placa", required: true },
                { name: "model", label: "Modelo" },
                { name: "color", label: "Cor" },
                { name: "parkingSpace", label: "Vaga" },
              ]}
              columns={[
                { key: "plate", label: "Placa" },
                { key: "model", label: "Modelo" },
                { key: "color", label: "Cor" },
                { key: "user", label: "Morador", render: (item) => item.user?.name ?? "-" },
                { key: "parkingSpace", label: "Vaga" },
              ]}
            />
          </TabsContent>

          <TabsContent value="pets">
            <OperationsCrud
              title="Pets"
              description="Cadastro de animais dos moradores"
              endpoint="/operations/pets"
              fields={[
                { name: "userId", label: "Morador", source: "users" },
                { name: "name", label: "Nome", required: true },
                { name: "species", label: "Espécie", required: true },
                { name: "breed", label: "Raça" },
                { name: "notes", label: "Observações", type: "textarea" },
              ]}
              columns={[
                { key: "name", label: "Nome" },
                { key: "species", label: "Espécie" },
                { key: "breed", label: "Raça" },
                { key: "user", label: "Morador", render: (item) => item.user?.name ?? "-" },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
