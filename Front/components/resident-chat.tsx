"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ResidentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou o assistente virtual do condomínio. Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("reserva")) {
      return "Para fazer uma reserva, acesse o menu 'Solicitar Reserva' no painel lateral. Lá você pode escolher a área comum e o horário desejado."
    } else if (input.includes("pagamento") || input.includes("boleto")) {
      return "Você pode visualizar e pagar seus boletos na seção 'Minhas Finanças'. Lá estão todas as suas cobranças pendentes e o histórico de pagamentos."
    } else if (input.includes("aviso") || input.includes("comunicado")) {
      return "Confira os avisos e comunicados importantes na seção 'Avisos' do menu. Lá você encontra informações sobre assembleias, manutenções e outros eventos."
    } else if (input.includes("ocorrência") || input.includes("problema")) {
      return "Para reportar um problema ou ocorrência, entre em contato com a administração através do telefone ou email disponível nos avisos."
    } else {
      return "Entendo. Posso ajudá-lo com informações sobre reservas, pagamentos, avisos e outras questões do condomínio. Como posso auxiliá-lo?"
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assistente Virtual</h1>
        <p className="text-sm md:text-base text-muted-foreground">Tire suas dúvidas sobre o condomínio</p>
      </div>

      <Card className="h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)]">
        <CardHeader className="border-b p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Chat com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-4rem)] md:h-[calc(100%-5rem)] p-0">
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 md:gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-xs md:text-sm leading-relaxed">{message.text}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 md:gap-3 justify-start">
                <div className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 md:px-4">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3 md:p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm md:text-base"
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
