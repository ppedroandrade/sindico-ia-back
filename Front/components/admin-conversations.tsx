"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, User, Clock, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Conversation {
  id: number
  user: string
  apartment: string
  topic: string
  messages: Message[]
  resolved: boolean
  date: string
  duration: string
  category: string
}

interface Message {
  id: number
  sender: "user" | "ai" | "admin"
  text: string
  time: string
}

export function AdminConversations() {
  const { toast } = useToast()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [replyText, setReplyText] = useState("")

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      user: "Roberto Lima",
      apartment: "Apto 301",
      topic: "Dúvida sobre boleto",
      messages: [
        { id: 1, sender: "user", text: "Olá, não recebi o boleto deste mês", time: "14:30" },
        {
          id: 2,
          sender: "ai",
          text: "Olá Roberto! Vou verificar isso para você. Qual é o seu apartamento?",
          time: "14:30",
        },
        { id: 3, sender: "user", text: "Apartamento 301", time: "14:31" },
        {
          id: 4,
          sender: "ai",
          text: "Encontrei seu cadastro. O boleto foi enviado para roberto.lima@email.com no dia 05/10. Gostaria que eu reenviasse?",
          time: "14:31",
        },
        { id: 5, sender: "user", text: "Sim, por favor", time: "14:32" },
        {
          id: 6,
          sender: "ai",
          text: "Boleto reenviado com sucesso! Verifique sua caixa de entrada e spam.",
          time: "14:32",
        },
      ],
      resolved: true,
      date: "2025-10-16 14:32",
      duration: "3 min",
      category: "Financeiro",
    },
    {
      id: 2,
      user: "Fernanda Souza",
      apartment: "Apto 205",
      topic: "Reserva de salão de festas",
      messages: [
        { id: 1, sender: "user", text: "Gostaria de reservar o salão de festas", time: "11:15" },
        { id: 2, sender: "ai", text: "Claro! Para qual data você gostaria de fazer a reserva?", time: "11:15" },
        { id: 3, sender: "user", text: "Para o dia 25 de outubro", time: "11:16" },
        {
          id: 4,
          sender: "ai",
          text: "Verificando disponibilidade... O salão está disponível no dia 25/10. Qual período? Manhã, tarde ou noite?",
          time: "11:16",
        },
        { id: 5, sender: "user", text: "Noite, das 19h às 23h", time: "11:17" },
        {
          id: 6,
          sender: "ai",
          text: "Perfeito! Reserva criada para 25/10 das 19h às 23h. O valor é R$ 150,00. Confirma?",
          time: "11:17",
        },
        { id: 7, sender: "user", text: "Confirmado!", time: "11:18" },
      ],
      resolved: true,
      date: "2025-10-16 11:15",
      duration: "5 min",
      category: "Reservas",
    },
    {
      id: 3,
      user: "Lucas Martins",
      apartment: "Apto 102",
      topic: "Problema no elevador",
      messages: [
        { id: 1, sender: "user", text: "O elevador está fazendo um barulho estranho", time: "09:45" },
        { id: 2, sender: "ai", text: "Obrigado por reportar, Lucas. Qual elevador especificamente?", time: "09:45" },
        { id: 3, sender: "user", text: "O elevador social, do lado direito", time: "09:46" },
        {
          id: 4,
          sender: "ai",
          text: "Entendi. Vou registrar esta ocorrência como urgente e notificar a manutenção. Você pode descrever o tipo de barulho?",
          time: "09:46",
        },
        { id: 5, sender: "user", text: "É um rangido metálico quando sobe", time: "09:47" },
        {
          id: 6,
          sender: "ai",
          text: "Ocorrência registrada. A equipe de manutenção foi notificada e deve verificar ainda hoje.",
          time: "09:47",
        },
      ],
      resolved: false,
      date: "2025-10-16 09:45",
      duration: "2 min",
      category: "Ocorrências",
    },
    {
      id: 4,
      user: "Mariana Santos",
      apartment: "Apto 404",
      topic: "Barulho excessivo",
      messages: [
        { id: 1, sender: "user", text: "Estou ouvindo muito barulho vindo do apartamento de cima", time: "22:30" },
        { id: 2, sender: "ai", text: "Lamento pelo incômodo, Mariana. Qual é o seu apartamento?", time: "22:30" },
        { id: 3, sender: "user", text: "404", time: "22:31" },
        {
          id: 4,
          sender: "ai",
          text: "Vou registrar a reclamação sobre barulho do apartamento 504. Isso está acontecendo agora?",
          time: "22:31",
        },
        { id: 5, sender: "user", text: "Sim, já faz mais de uma hora", time: "22:32" },
      ],
      resolved: false,
      date: "2025-10-16 22:30",
      duration: "2 min",
      category: "Ocorrências",
    },
  ])

  const pendingConversations = conversations.filter((c) => !c.resolved)
  const resolvedConversations = conversations.filter((c) => c.resolved)

  const categoryColors = {
    Financeiro: "bg-primary/10 text-primary border-primary/20",
    Reservas: "bg-accent/10 text-accent border-accent/20",
    Ocorrências: "bg-destructive/10 text-destructive border-destructive/20",
    Geral: "bg-muted text-muted-foreground border-border",
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return

    const newMessage: Message = {
      id: selectedConversation.messages.length + 1,
      sender: "admin",
      text: replyText,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id ? { ...conv, messages: [...conv.messages, newMessage] } : conv,
      ),
    )

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
    })

    setReplyText("")

    toast({
      title: "Resposta enviada",
      description: "Sua mensagem foi enviada ao morador",
    })
  }

  const handleMarkAsResolved = () => {
    if (!selectedConversation) return

    setConversations(
      conversations.map((conv) => (conv.id === selectedConversation.id ? { ...conv, resolved: true } : conv)),
    )

    setSelectedConversation({ ...selectedConversation, resolved: true })

    toast({
      title: "Conversa resolvida",
      description: "A conversa foi marcada como resolvida",
    })
  }

  const handleMarkAsPending = () => {
    if (!selectedConversation) return

    setConversations(
      conversations.map((conv) => (conv.id === selectedConversation.id ? { ...conv, resolved: false } : conv)),
    )

    setSelectedConversation({ ...selectedConversation, resolved: false })

    toast({
      title: "Conversa reaberta",
      description: "A conversa foi marcada como pendente",
    })
  }

  const renderConversationList = (convList: Conversation[]) => (
    <div className="space-y-3">
      {convList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm md:text-base">Nenhuma conversa encontrada</p>
        </div>
      ) : (
        convList.map((conversation) => (
          <div
            key={conversation.id}
            className="p-3 md:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setSelectedConversation(conversation)}
          >
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-xs md:text-sm">{conversation.topic}</p>
                      <Badge
                        variant="outline"
                        className={`${
                          categoryColors[conversation.category as keyof typeof categoryColors] || categoryColors.Geral
                        } text-xs`}
                      >
                        {conversation.category}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {conversation.apartment} - {conversation.user}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between pl-0 md:pl-13">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {conversation.messages.length} mensagens
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {conversation.duration}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{conversation.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  if (selectedConversation) {
    return (
      <Card className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            {selectedConversation.resolved ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsPending}
                className="w-full sm:w-auto bg-transparent"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Reabrir Conversa
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsResolved}
                className="w-full sm:w-auto bg-transparent"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Resolvida
              </Button>
            )}
          </div>

          <div className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedConversation.topic}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.apartment} - {selectedConversation.user}
                </p>
              </div>
              <div className="ml-auto">
                <Badge
                  variant="outline"
                  className={
                    categoryColors[selectedConversation.category as keyof typeof categoryColors] || categoryColors.Geral
                  }
                >
                  {selectedConversation.category}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 md:gap-3 ${message.sender === "user" ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.sender === "user" ? "bg-muted" : message.sender === "ai" ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-3 w-3 md:h-4 md:w-4" />
                  ) : message.sender === "ai" ? (
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  ) : (
                    <span className="text-xs font-semibold text-accent">A</span>
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[85%] md:max-w-[80%] ${message.sender === "user" ? "" : "flex flex-col items-end"}`}
                >
                  <div
                    className={`rounded-lg p-2 md:p-3 ${
                      message.sender === "user"
                        ? "bg-muted"
                        : message.sender === "ai"
                          ? "bg-primary/10"
                          : "bg-accent/10"
                    }`}
                  >
                    <p className="text-xs md:text-sm">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{message.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 md:p-6">
      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold">Conversas</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Gerencie e responda às conversas dos moradores</p>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Pendentes ({pendingConversations.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Resolvidas ({resolvedConversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {renderConversationList(pendingConversations)}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {renderConversationList(resolvedConversations)}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
