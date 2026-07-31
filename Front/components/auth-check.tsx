"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiRequest, type User } from "@/lib/api"
import { publishCurrentUser } from "@/components/auth-context"
import { isSafeRedirectPath } from "@/lib/utils"

function loginUrlWithRedirect(pathname: string, reason?: "session_expired") {
  const params = new URLSearchParams()
  if (isSafeRedirectPath(pathname)) params.set("redirect", pathname)
  if (reason) params.set("reason", reason)
  const query = params.toString()
  return query ? `/login?${query}` : "/login"
}

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
        router.push(loginUrlWithRedirect(pathname))
        return
      }

      try {
        const fetchedUser = (await apiRequest("/auth/me")) as User
        if (!isMounted) return

        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", fetchedUser.email)
        localStorage.setItem("userRole", fetchedUser.role)
        localStorage.setItem("userName", fetchedUser.name)
        if (fetchedUser.apartment) localStorage.setItem("userUnit", fetchedUser.apartment)
        else localStorage.removeItem("userUnit")
        publishCurrentUser(fetchedUser)

        const adminOnlyRoutes = ["/", "/usuarios", "/estrutura", "/relatorios", "/auditoria", "/configuracoes", "/limpeza/relatorios", "/areas-comuns"]
        const isAdminRoute = adminOnlyRoutes.some((route) =>
          route === "/" ? pathname === "/" : pathname.startsWith(route),
        )

        if (fetchedUser.role !== "admin" && isAdminRoute) {
          if (fetchedUser.role === "limpeza") {
            router.push("/limpeza")
          } else {
            router.push("/avisos")
          }
        }
      } catch {
        localStorage.clear()
        router.push(loginUrlWithRedirect(pathname, "session_expired"))
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
