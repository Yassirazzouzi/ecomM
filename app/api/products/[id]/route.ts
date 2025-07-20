import { type NextRequest, NextResponse } from "next/server"
import { ProductService } from "@/lib/services/product-service"

// GET - Récupérer un produit par ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await ProductService.getProductById(params.id)

    if (!product) {
      return NextResponse.json({ success: false, error: "Produit non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Erreur API GET /products/[id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

// PUT - Mettre à jour un produit
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const product = await ProductService.updateProduct(params.id, body)

    if (!product) {
      return NextResponse.json({ success: false, error: "Produit non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Erreur API PUT /products/[id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await ProductService.deleteProduct(params.id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Produit non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Produit supprimé avec succès",
    })
  } catch (error) {
    console.error("Erreur API DELETE /products/[id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
