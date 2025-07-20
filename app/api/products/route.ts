import { type NextRequest, NextResponse } from "next/server"
import { ProductService } from "@/lib/services/product-service"

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined

    const products = await ProductService.getAllProducts(search)

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    })
  } catch (error) {
    console.error("Erreur API GET /products:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation basique
    if (
      !body.nom ||
      !body.categorie ||
      body.quantite === undefined ||
      !body.prixUnitaire ||
      body.seuilAlerte === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes: nom, categorie, quantite, prixUnitaire et seuilAlerte sont requis",
        },
        { status: 400 },
      )
    }

    const product = await ProductService.createProduct(body)

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur API POST /products:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
