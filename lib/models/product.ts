import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  id?: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
  image?: string
  dateCreation?: Date
  dateModification?: Date
  metadata?: {
    fournisseur?: string
    reference?: string
    description?: string
    emplacement?: string
  }
}

export interface ProductStats {
  totalProduits: number
  valeurTotaleStock: number
  nombreCategories: number
  produitsEnAlerte: number
  categoriesStats: Array<{
    categorie: string
    count: number
    valeurTotale: number
  }>
}

// Fonction pour convertir un produit MongoDB en produit pour l'interface
export function convertMongoProduct(mongoProduct: any): Product {
  return {
    id: mongoProduct._id.toString(),
    _id: mongoProduct._id,
    nom: mongoProduct.nom,
    categorie: mongoProduct.categorie,
    quantite: mongoProduct.quantite,
    prixUnitaire: mongoProduct.prixUnitaire,
    seuilAlerte: mongoProduct.seuilAlerte,
    image: mongoProduct.image,
    dateCreation: mongoProduct.dateCreation,
    dateModification: mongoProduct.dateModification,
    metadata: mongoProduct.metadata,
  }
}

// Fonction pour préparer un produit pour l'insertion en base
export function prepareProductForMongo(product: Omit<Product, "id" | "_id">): Omit<Product, "id"> {
  const now = new Date()
  return {
    ...product,
    dateCreation: now,
    dateModification: now,
  }
}
