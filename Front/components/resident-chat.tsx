"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError, apiRequest, type AiConversation, type ChatMessage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Bot, Send } from "lucide-react"

export function ResidentChat() {
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadConversations = async () => {
    try {
      const loaded = (await apiRequest("/ai/conversations")) as AiConversation[]
      setConversations(loaded)
      setActiveConversationId((current) => current ?? loaded[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as conversas")
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

  const messages = activeConversation?.messages ?? []

  const handleSendMessage = async () => {
    const content = inputValue.trim()
    if (!content || isSending) return

    setIsSending(true)
    setInputValue("")

    try {
      const response = (await apiRequest("/ai/messages", {
        method: "POST",
        body: JSON.stringify({ conversationId: activeConversation?.id, content }),
      })) as { conversationId: string; message: ChatMessage }

      await loadConversations()
      setActiveConversationId(response.conversationId)
    } catch {
      setInputValue(content)
      toast({
        title: "Mensagem não enviada",
        description: "Não foi possível registrar a mensagem no backend.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assistente virtual</h1>
        <p className="text-sm md:text-base text-muted-foreground">Mensagens salvas no histórico real da aplicação</p>
      </div>

      <Card className="h-[calc(100vh-12rem)] min-h-[32rem]">
        <CardHeader className="border-b p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Chat com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-4rem)] md:h-[calc(100%-5rem)] flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4">
            {error ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-destructive">{error}</div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                Nenhuma mensagem registrada.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        message.role === "user"
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

          <div className="border-t p-3 md:p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="shrink-0" disabled={isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
