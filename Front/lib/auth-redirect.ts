// Where to send the user back to after login, and why they landed on /login in the
// first place (e.g. an expired session). Kept in sessionStorage instead of the URL
// query string so /login stays a clean URL instead of showing ?redirect=...&reason=...

import { isSafeRedirectPath } from "@/lib/utils"

const REDIRECT_KEY = "postLoginRedirect"
const REASON_KEY = "postLoginReason"

export function setPostLoginRedirect(path: string, reason?: "session_expired") {
  if (typeof window === "undefined") return
  if (isSafeRedirectPath(path)) sessionStorage.setItem(REDIRECT_KEY, path)
  if (reason) sessionStorage.setItem(REASON_KEY, reason)
}

/** Reads and clears the stored redirect/reason — meant to be consumed once. */
export function consumePostLoginRedirect() {
  if (typeof window === "undefined") return { path: undefined, reason: undefined }
  const path = sessionStorage.getItem(REDIRECT_KEY)
  const reason = sessionStorage.getItem(REASON_KEY)
  sessionStorage.removeItem(REDIRECT_KEY)
  sessionStorage.removeItem(REASON_KEY)
  return {
    path: isSafeRedirectPath(path) ? path : undefined,
    reason: reason === "session_expired" ? ("session_expired" as const) : undefined,
  }
}
