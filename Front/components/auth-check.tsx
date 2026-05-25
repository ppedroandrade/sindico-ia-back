"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiRequest, type User } from "@/lib/api"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkAuth() {
      if (pathname === "/login") {
        setIsChecking(false)
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const user = (await apiRequest("/auth/me")) as User
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", user.email)
        localStorage.setItem("userRole", user.role)
        localStorage.setItem("userName", user.name)
        if (user.apartment) localStorage.setItem("userUnit", user.apartment)
        else localStorage.removeItem("userUnit")

        const adminOnlyRoutes = ["/", "/usuarios", "/ocorrencias", "/configuracoes", "/limpeza/relatorios"]
        const isAdminRoute = adminOnlyRoutes.some((route) =>
          route === "/" ? pathname === "/" : pathname.startsWith(route),
        )

        if (user.role !== "admin" && isAdminRoute) {
          if (user.role === "limpeza") {
            router.push("/limpeza")
          } else {
            router.push("/avisos")
          }
        }
      } catch {
        localStorage.clear()
        router.push("/login")
      } finally {
        if (isMounted) setIsChecking(false)
      }
    }

    checkAuth()
    return () => {
      isMounted = false
    }
  }, [router, pathname])

  if (isChecking && pathname !== "/login") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
