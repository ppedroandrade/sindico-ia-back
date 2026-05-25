"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, apiRequest, type AiConversation, type ChatMessage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

export function AdminConversations() {
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadConversations = async () => {
    try {
      const loaded = (await apiRequest("/ai/conversations")) as AiConversation[]
      setConversations(loaded)
      setActiveConversationId((current) => current ?? loaded[0]?.id ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar conversas")
    }
  }

  useEffect(() => {
    loadConversations()
    const interval = window.setInterval(loadConversations, 4000)
    return () => window.clearInterval(interval)
  }, [])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  )

  const sendReply = async () => {
    const content = reply.trim()
    if (!content || !activeConversation || isSending) return

    setIsSending(true)
    setReply("")
    try {
      const response = (await apiRequest("/ai/messages", {
        method: "POST",
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content,
          role: "assistant",
        }),
      })) as { conversationId: string; message: ChatMessage }

      setActiveConversationId(response.conversationId)
      await loadConversations()
    } catch (err) {
      setReply(content)
      toast({
        title: "Resposta não enviada",
        description: err instanceof ApiError ? err.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      sendReply()
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid min-h-[34rem] lg:grid-cols-[18rem_1fr]">
        <div className="border-b p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Conversas</h3>
            <p className="text-sm text-muted-foreground">Atendimento aos moradores</p>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conversa registrada.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={
                    activeConversation?.id === conversation.id
                      ? "w-full rounded-lg border bg-primary/10 p-3 text-left"
                      : "w-full rounded-lg border p-3 text-left hover:bg-muted"
                  }
                >
                  <p className="truncate text-sm font-medium">{conversation.user?.name ?? "Morador"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {conversation.user?.apartment ? `Apto ${conversation.user.apartment} - ` : ""}
                    {conversation.title || "Conversa sem título"}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {conversation.messages.length} mensagens
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-h-[34rem] flex-col">
          <div className="border-b p-4">
            <h4 className="font-semibold">{activeConversation?.user?.name ?? "Selecione uma conversa"}</h4>
            <p className="text-sm text-muted-foreground">
              {activeConversation?.user?.apartment ? `Apartamento ${activeConversation.user.apartment}` : "Histórico do atendimento"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!activeConversation ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma conversa selecionada.
              </div>
            ) : activeConversation.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma mensagem registrada.
              </div>
            ) : (
              <div className="space-y-3">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={message.role === "assistant" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        message.role === "assistant"
                          ? "max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                          : "max-w-[80%] rounded-lg bg-muted px-4 py-2"
                      }
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Responder ao morador..."
                disabled={!activeConversation || isSending}
                className="min-h-20"
              />
              <Button onClick={sendReply} disabled={!activeConversation || isSending || !reply.trim()} size="icon" className="h-20 w-12 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
