"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Home } from "lucide-react"
import { setPostLoginRedirect } from "@/lib/auth-redirect"

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      if (pathname && pathname !== "/") setPostLoginRedirect(pathname)
      router.replace("/login")
      return
    }
    setIsAuthenticated(true)
    setChecked(true)
  }, [router, pathname])

  if (!checked && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold">Página não encontrada</h1>
          <p className="text-sm text-muted-foreground">
            O endereço que você tentou acessar não existe ou foi movido.
          </p>
        </div>
        <Button onClick={() => router.push("/")} className="w-full">
          <Home className="h-4 w-4" />
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
