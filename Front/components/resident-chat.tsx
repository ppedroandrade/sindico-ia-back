"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  text: string
  sender: "user"
}

export function ResidentChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const message: Message = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      sender: "user",
    }

    setMessages((prev) => [...prev, message])
    setInputValue("")

    try {
      await apiRequest("/ai/messages", {
        method: "POST",
        body: JSON.stringify({ content: message.text }),
      })
    } catch {
      toast({
        title: "Mensagem não enviada",
        description: "Não foi possível registrar a mensagem no backend.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assistente Virtual</h1>
        <p className="text-sm md:text-base text-muted-foreground">Histórico real de mensagens com IA</p>
      </div>

      <Card className="h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)]">
        <CardHeader className="border-b p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Chat com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-4rem)] md:h-[calc(100%-5rem)] flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                Nenhuma mensagem registrada.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                      <p className="text-sm">{message.text}</p>
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
