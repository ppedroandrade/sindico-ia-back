"use client"

import { useEffect, useState } from "react"
import type { User, UserRole } from "@/lib/api"

const USER_READY_EVENT = "sindico:user-ready"

export function publishCurrentUser(user: User) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<User>(USER_READY_EVENT, { detail: user }))
}

function readUserFromStorage(): User | null {
  if (typeof window === "undefined") return null
  const role = localStorage.getItem("userRole") as UserRole | null
  if (!role) return null
  return {
    id: "",
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    role,
    apartment: localStorage.getItem("userUnit") || null,
  }
}

/**
 * Reads the logged-in user without relying on React context, because pages compose
 * <DashboardLayout> (which owns the auth check) as their own child rather than the
 * other way around — a page's top-level body is an ancestor of AuthCheck's provider,
 * not a descendant, so context alone can never reach it. Falls back to localStorage
 * for the initial value, then listens for the event AuthCheck fires once /auth/me resolves.
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(() => readUserFromStorage())

  useEffect(() => {
    const fresh = readUserFromStorage()
    if (fresh) setUser(fresh)

    function handleUserReady(event: Event) {
      const detail = (event as CustomEvent<User>).detail
      if (detail) setUser(detail)
    }

    window.addEventListener(USER_READY_EVENT, handleUserReady)
    return () => window.removeEventListener(USER_READY_EVENT, handleUserReady)
  }, [])

  return user
}
