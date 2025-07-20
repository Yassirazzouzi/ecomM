import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/product-service"

// GET - Récupérer les statistiques
export async function GET() {
  try {
    const stats = await ProductService.getStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Erreur API GET /products/stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
