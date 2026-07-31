"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CirclePlus,
  Database,
  FilePenLine,
  MessageSquareText,
  ShieldCheck,
  Trash2,
  UserRound,
  Vote,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiError, apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  metadata?: { status?: string } | null;
  user?: { name?: string | null; role?: string | null } | null;
};

const actionDetails = {
  create: {
    label: "Criou um registro",
    icon: CirclePlus,
    tone: "text-success bg-success/10",
  },
  create_batch: {
    label: "Gerou registros em lote",
    icon: CirclePlus,
    tone: "text-success bg-success/10",
  },
  update: {
    label: "Atualizou um registro",
    icon: FilePenLine,
    tone: "text-primary bg-primary/10",
  },
  delete: {
    label: "Removeu um registro",
    icon: Trash2,
    tone: "text-destructive bg-destructive/10",
  },
  comment: {
    label: "Adicionou uma resposta",
    icon: MessageSquareText,
    tone: "text-primary bg-primary/10",
  },
  vote: {
    label: "Registrou um voto",
    icon: Vote,
    tone: "text-accent bg-accent/10",
  },
  seed: {
    label: "Atualizou os dados do sistema",
    icon: Database,
    tone: "text-muted-foreground bg-muted",
  },
} as const;

const moduleNames: Record<string, string> = {
  payment: "Financeiro",
  reservation: "Reservas",
  occurrence: "Ocorrências",
  announcement: "Avisos",
  user: "Usuários",
  unit: "Estrutura",
  "parking-space": "Estrutura",
  vehicle: "Estrutura",
  pet: "Estrutura",
  visitor: "Portaria",
  package: "Portaria",
  maintenance: "Manutenção",
  assembly: "Assembleias",
  settings: "Configurações",
  aiConversation: "Chatbot / IA",
  database: "Sistema",
};

const statusNames: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  paid: "Pago",
  overdue: "Vencido",
};

function getActionDetails(action: string) {
  return (
    actionDetails[action as keyof typeof actionDetails] ?? {
      label: "Realizou uma atividade",
      icon: CheckCircle2,
      tone: "text-primary bg-primary/10",
    }
  );
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLogs((await apiRequest("/operations/audit")) as AuditLog[]);
      } catch (requestError) {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "Não foi possível carregar as atividades.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Segurança e rastreabilidade
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">Auditoria</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Atividades administrativas registradas no sistema
            </p>
          </div>
          {!isLoading && !error && (
            <Badge variant="outline" className="w-fit">
              {logs.length} {logs.length === 1 ? "atividade" : "atividades"}
            </Badge>
          )}
        </div>

        <Card className="overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando atividades...
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-destructive">{error}</p>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <CalendarClock className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Nenhuma atividade registrada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                As próximas ações administrativas aparecerão aqui.
              </p>
            </div>
          ) : (
            <ol className="divide-y">
              {logs.map((log) => {
                const details = getActionDetails(log.action);
                const Icon = details.icon;
                const status = log.metadata?.status
                  ? (statusNames[log.metadata.status] ?? log.metadata.status)
                  : null;
                return (
                  <li
                    key={log.id}
                    className="relative flex gap-4 px-4 py-5 transition-colors hover:bg-muted/40 sm:px-6"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        details.tone,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium leading-6">
                            {details.label}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <UserRound className="h-3.5 w-3.5" />
                              {log.user?.name || "Sistema"}
                            </span>
                            <span>
                              {moduleNames[log.entity] ?? "Administração"}
                            </span>
                          </div>
                        </div>
                        <time
                          className="shrink-0 text-xs text-muted-foreground"
                          dateTime={log.createdAt}
                        >
                          {new Date(log.createdAt).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {moduleNames[log.entity] ?? "Administração"}
                        </Badge>
                        {status && <Badge variant="outline">{status}</Badge>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
