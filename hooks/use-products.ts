"use client"

import { useState, useEffect, useCallback } from "react"
import type { Product, ProductStats } from "@/lib/models/product"

interface UseProductsOptions {
  search?: string
}

interface UseProductsReturn {
  products: Product[]
  stats: ProductStats | null
  categories: string[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createProduct: (product: Omit<Product, "id" | "_id">) => Promise<boolean>
  updateProduct: (id: string, product: Partial<Omit<Product, "id" | "_id">>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  bulkCreateProducts: (products: Omit<Product, "id" | "_id">[]) => Promise<boolean>
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    try {
      setError(null)
      const searchParam = options.search ? `?search=${encodeURIComponent(options.search)}` : ""
      const response = await fetch(`/api/products${searchParam}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la récupération des produits")
      }

      setProducts(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
      setProducts([])
    }
  }, [options.search])

  // Fonction pour récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/products/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err)
    }
  }, [])

  // Fonction pour récupérer les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/products/categories")
      const data = await response.json()

      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des catégories:", err)
    }
  }, [])

  // Fonction pour tout recharger
  const refetch = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchProducts(), fetchStats(), fetchCategories()])
    setLoading(false)
  }, [fetchProducts, fetchStats, fetchCategories])

  // Fonction pour créer un produit
  const createProduct = useCallback(
    async (product: Omit<Product, "id" | "_id">): Promise<boolean> => {
      try {
        setError(null)
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de la création du produit")
        }

        await refetch()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [refetch],
  )

  // Fonction pour mettre à jour un produit
  const updateProduct = useCallback(
    async (id: string, product: Partial<Omit<Product, "id" | "_id">>): Promise<boolean> => {
      try {
        setError(null)
        const response = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de la mise à jour du produit")
        }

        await refetch()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [refetch],
  )

  // Fonction pour supprimer un produit
  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de la suppression du produit")
        }

        await refetch()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [refetch],
  )

  // Fonction pour créer plusieurs produits
  const bulkCreateProducts = useCallback(
    async (products: Omit<Product, "id" | "_id">[]): Promise<boolean> => {
      try {
        setError(null)
        const response = await fetch("/api/products/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de la création des produits")
        }

        await refetch()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [refetch],
  )

  // Effet pour charger les données au montage et quand la recherche change
  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    products,
    stats,
    categories,
    loading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts,
  }
}
