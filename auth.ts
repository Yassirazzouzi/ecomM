import "server-only"
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/user"
import bcrypt from "bcryptjs"

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not set. Please set it in your .env.local file.")
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("NEXTAUTH_URL is not set. This might cause issues with callbacks in production.")
}

/* ---------- 1. Options NextAuth ---------- */
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const db = await getDatabase()
        const users = db.collection<User>("users")
        const user = await users.findOne({ email: credentials.email })

        if (user?.password && (await bcrypt.compare(credentials.password, user.password))) {
          return { id: user._id!.toString(), email: user.email, name: user.name ?? undefined }
        }
        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
}

/* ---------- 2. Handler API Route ---------- */
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

/* ---------- 3. Utilitaire serveur getSession ---------- */
import { getServerSession } from "next-auth"
export function auth() {
  return getServerSession(authOptions)
}
