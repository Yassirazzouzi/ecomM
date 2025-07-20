import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  id?: string
  nom: string
  quantite: number
  prixUnitaire: number
  image?: string
}

// Fonction pour convertir un produit MongoDB en produit pour l'interface
export function convertMongoProduct(mongoProduct: any): Product {
  return {
    id: mongoProduct._id?.toString(),
    _id: mongoProduct._id,
    nom: mongoProduct.nom,
    quantite: mongoProduct.quantite,
    prixUnitaire: mongoProduct.prixUnitaire,
    image: mongoProduct.image,
  }
}

// Fonction pour préparer un produit pour l'insertion en base
export function prepareProductForMongo(product: Omit<Product, "id" | "_id">): Omit<Product, "id"> {
  return {
    ...product
  }
}
