import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Only allow same-origin internal paths as a post-login redirect target,
 * blocking protocol-relative ("//evil.com") or absolute external URLs.
 */
export function isSafeRedirectPath(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path === '/login') return false
  return true
}
