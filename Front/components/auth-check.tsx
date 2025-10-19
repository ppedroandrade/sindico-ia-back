"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
    } else if (isAuthenticated && userRole) {
      const adminOnlyRoutes = ["/", "/ocorrencias", "/configuracoes", "/limpeza/relatorios"]
      const isAdminRoute = adminOnlyRoutes.some((route) =>
        route === "/" ? pathname === "/" : pathname.startsWith(route),
      )

      // Redirect non-admin users away from admin routes
      if (userRole !== "admin" && isAdminRoute && pathname !== "/login") {
        if (userRole === "limpeza") {
          router.push("/limpeza")
        } else {
          router.push("/avisos")
        }
      }
      setIsChecking(false)
    } else {
      setIsChecking(false)
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
