"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import type React from "react"

interface AuthSessionProviderProps {
  children: React.ReactNode
  session: Session | null
}

export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
