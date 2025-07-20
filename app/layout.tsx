import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth" // Assurez-vous que authOptions est exporté de auth.ts
import { AuthSessionProvider } from "@/components/auth/auth-session-provider" // Importez le nouveau composant

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dashboard Dépôt",
  description: "Gestion d'inventaire avec Next.js et MongoDB",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions) // Obtenir la session côté serveur

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
