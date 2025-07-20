import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/product-service"

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await ProductService.getCategories()

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Erreur API GET /products/categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
