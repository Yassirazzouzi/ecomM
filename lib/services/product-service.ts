import { getDatabase } from "../mongodb"
import { type Product, type ProductStats, convertMongoProduct, prepareProductForMongo } from "../models/product"
import { ObjectId } from "mongodb"

const COLLECTION_NAME = "products"

export class ProductService {
  // Obtenir tous les produits
  static async getAllProducts(search?: string): Promise<Product[]> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      let query = {}
      if (search) {
        query = {
          $or: [{ nom: { $regex: search, $options: "i" } }, { categorie: { $regex: search, $options: "i" } }],
        }
      }

      const products = await collection.find(query).sort({ dateCreation: -1 }).toArray()
      return products.map(convertMongoProduct)
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error)
      throw new Error("Impossible de récupérer les produits")
    }
  }

  // Obtenir un produit par ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      const product = await collection.findOne({ _id: new ObjectId(id) })
      return product ? convertMongoProduct(product) : null
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error)
      throw new Error("Impossible de récupérer le produit")
    }
  }

  // Créer un nouveau produit
  static async createProduct(productData: Omit<Product, "id" | "_id">): Promise<Product> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      const product = prepareProductForMongo(productData)
      const result = await collection.insertOne(product)

      const createdProduct = await collection.findOne({ _id: result.insertedId })
      if (!createdProduct) {
        throw new Error("Produit créé mais non trouvé")
      }

      return convertMongoProduct(createdProduct)
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error)
      throw new Error("Impossible de créer le produit")
    }
  }

  // Mettre à jour un produit
  static async updateProduct(id: string, productData: Partial<Omit<Product, "id" | "_id">>): Promise<Product | null> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      const updateData = {
        ...productData,
        dateModification: new Date(),
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      )

      return result ? convertMongoProduct(result) : null
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error)
      throw new Error("Impossible de mettre à jour le produit")
    }
  }

  // Supprimer un produit
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount === 1
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      throw new Error("Impossible de supprimer le produit")
    }
  }

  // Créer plusieurs produits en une fois
  static async createManyProducts(productsData: Omit<Product, "id" | "_id">[]): Promise<Product[]> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      const products = productsData.map(prepareProductForMongo)
      const result = await collection.insertMany(products)

      const createdProducts = await collection
        .find({
          _id: { $in: Object.values(result.insertedIds) },
        })
        .toArray()

      return createdProducts.map(convertMongoProduct)
    } catch (error) {
      console.error("Erreur lors de la création des produits:", error)
      throw new Error("Impossible de créer les produits")
    }
  }

  // Obtenir les statistiques
  static async getStats(): Promise<ProductStats> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      // Agrégation pour obtenir les statistiques
      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalProduits: { $sum: 1 },
              valeurTotaleStock: { $sum: { $multiply: ["$quantite", "$prixUnitaire"] } },
              categories: { $addToSet: "$categorie" },
            },
          },
        ])
        .toArray()

      // Statistiques par catégorie
      const categoriesStats = await collection
        .aggregate([
          {
            $group: {
              _id: "$categorie",
              count: { $sum: 1 },
              valeurTotale: { $sum: { $multiply: ["$quantite", "$prixUnitaire"] } },
            },
          },
          {
            $project: {
              categorie: "$_id",
              count: 1,
              valeurTotale: 1,
              _id: 0,
            },
          },
        ])
        .toArray()

      // Compter les produits en alerte
      const produitsEnAlerte = await collection.countDocuments({
        $expr: { $lte: ["$quantite", "$seuilAlerte"] },
      })

      const baseStats = stats[0] || {
        totalProduits: 0,
        valeurTotaleStock: 0,
        categories: [],
      }

      return {
        totalProduits: baseStats.totalProduits,
        valeurTotaleStock: baseStats.valeurTotaleStock,
        nombreCategories: baseStats.categories.length,
        produitsEnAlerte,
        categoriesStats,
      }
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error)
      throw new Error("Impossible de calculer les statistiques")
    }
  }

  // Obtenir les catégories uniques
  static async getCategories(): Promise<string[]> {
    try {
      const db = await getDatabase()
      const collection = db.collection(COLLECTION_NAME)

      const categories = await collection.distinct("categorie")
      return categories.sort()
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      throw new Error("Impossible de récupérer les catégories")
    }
  }
}
