import DepotDashboard from "../depot-dashboard"
import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    // Si non authentifié, rediriger vers la page de connexion
    redirect("/login")
  }

  return <DepotDashboard />
}
