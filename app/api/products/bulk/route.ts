import { type NextRequest, NextResponse } from "next/server"
import { ProductService } from "@/lib/services/product-service"

// POST - Créer plusieurs produits en une fois
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!Array.isArray(body.products)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ "products" doit être un tableau',
        },
        { status: 400 },
      )
    }

    // Validation basique pour chaque produit
    for (const product of body.products) {
      if (
        !product.nom ||
        !product.categorie ||
        product.quantite === undefined ||
        !product.prixUnitaire ||
        product.seuilAlerte === undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Chaque produit doit avoir: nom, categorie, quantite, prixUnitaire et seuilAlerte",
          },
          { status: 400 },
        )
      }
    }

    const products = await ProductService.createManyProducts(body.products)

    return NextResponse.json(
      {
        success: true,
        data: products,
        count: products.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur API POST /products/bulk:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
