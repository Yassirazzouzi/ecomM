// Simulation d'un service de prédictions IA pour les stocks
export interface StockPrediction {
  productId: string
  productName: string
  currentStock: number
  predictedStock: number[]
  dates: string[]
  confidence: number
  recommendation: "restock" | "reduce" | "maintain"
  recommendationReason: string
  riskLevel: "low" | "medium" | "high"
}

export interface MarketTrend {
  category: string
  trend: "growing" | "stable" | "declining"
  growthRate: number
  seasonality: boolean
  peakMonths: number[]
}

export interface OptimizationSuggestion {
  type: "reorder_point" | "safety_stock" | "order_quantity"
  productId: string
  productName: string
  currentValue: number
  suggestedValue: number
  expectedBenefit: string
  confidence: number
}

// Générer des prédictions de stock basées sur l'IA
export function generateStockPredictions(products: any[]): StockPrediction[] {
  const now = new Date()

  return products.map((product) => {
    // Générer des dates pour les 6 prochains mois
    const dates = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
      return date.toISOString().split("T")[0]
    })

    // Simuler une tendance basée sur différents facteurs
    const baseStock = product.quantite
    const seasonalityFactor = Math.sin((now.getMonth() / 12) * 2 * Math.PI) * 0.2
    const trendFactor = (Math.random() - 0.5) * 0.3
    const volatility = Math.random() * 0.1

    const predictedStock = dates.map((_, index) => {
      const monthlyDecline = 0.15 // 15% de consommation mensuelle moyenne
      const seasonal = seasonalityFactor * Math.sin(((index + now.getMonth()) / 12) * 2 * Math.PI)
      const trend = trendFactor * (index + 1)
      const noise = (Math.random() - 0.5) * volatility

      const prediction = baseStock * (1 - monthlyDecline * (index + 1)) * (1 + seasonal + trend + noise)
      return Math.max(0, Math.round(prediction))
    })

    // Déterminer la recommandation
    const minPredicted = Math.min(...predictedStock)
    const avgPredicted = predictedStock.reduce((a, b) => a + b, 0) / predictedStock.length

    let recommendation: "restock" | "reduce" | "maintain"
    let recommendationReason: string
    let riskLevel: "low" | "medium" | "high"

    if (minPredicted <= product.seuilAlerte) {
      recommendation = "restock"
      recommendationReason = `Stock prévu sous le seuil d'alerte (${product.seuilAlerte}) dans ${predictedStock.findIndex((s) => s <= product.seuilAlerte) + 1} mois`
      riskLevel = "high"
    } else if (avgPredicted < baseStock * 0.5) {
      recommendation = "restock"
      recommendationReason = "Consommation prévue élevée, réapprovisionnement recommandé"
      riskLevel = "medium"
    } else if (avgPredicted > baseStock * 1.2) {
      recommendation = "reduce"
      recommendationReason = "Surstockage prévu, réduction des commandes recommandée"
      riskLevel = "low"
    } else {
      recommendation = "maintain"
      recommendationReason = "Niveau de stock optimal prévu"
      riskLevel = "low"
    }

    const confidence = Math.random() * 0.3 + 0.7 // 70-100% de confiance

    return {
      productId: product.id,
      productName: product.nom,
      currentStock: baseStock,
      predictedStock,
      dates,
      confidence: Number(confidence.toFixed(2)),
      recommendation,
      recommendationReason,
      riskLevel,
    }
  })
}

// Générer des tendances de marché
export function generateMarketTrends(products: any[]): MarketTrend[] {
  const categories = [...new Set(products.map((p) => p.categorie))]

  return categories.map((category) => {
    const trends = ["growing", "stable", "declining"] as const
    const trend = trends[Math.floor(Math.random() * trends.length)]

    let growthRate: number
    switch (trend) {
      case "growing":
        growthRate = Math.random() * 15 + 5 // 5-20%
        break
      case "declining":
        growthRate = -(Math.random() * 10 + 2) // -2% à -12%
        break
      default:
        growthRate = (Math.random() - 0.5) * 4 // -2% à +2%
    }

    const seasonality = Math.random() > 0.4 // 60% de chance d'avoir de la saisonnalité
    const peakMonths = seasonality
      ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => Math.floor(Math.random() * 12))
      : []

    return {
      category,
      trend,
      growthRate: Number(growthRate.toFixed(1)),
      seasonality,
      peakMonths: peakMonths.sort(),
    }
  })
}

// Générer des suggestions d'optimisation
export function generateOptimizationSuggestions(products: any[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []

  products.forEach((product) => {
    // Suggestion pour le point de commande
    if (Math.random() > 0.7) {
      const currentReorderPoint = product.seuilAlerte
      const suggestedReorderPoint = Math.round(currentReorderPoint * (1 + (Math.random() - 0.5) * 0.4))

      suggestions.push({
        type: "reorder_point",
        productId: product.id,
        productName: product.nom,
        currentValue: currentReorderPoint,
        suggestedValue: suggestedReorderPoint,
        expectedBenefit:
          suggestedReorderPoint > currentReorderPoint
            ? "Réduction du risque de rupture de stock"
            : "Réduction des coûts de stockage",
        confidence: Math.random() * 0.2 + 0.8,
      })
    }

    // Suggestion pour le stock de sécurité
    if (Math.random() > 0.8) {
      const currentSafetyStock = Math.round(product.quantite * 0.1)
      const suggestedSafetyStock = Math.round(currentSafetyStock * (1 + (Math.random() - 0.5) * 0.6))

      suggestions.push({
        type: "safety_stock",
        productId: product.id,
        productName: product.nom,
        currentValue: currentSafetyStock,
        suggestedValue: suggestedSafetyStock,
        expectedBenefit: "Optimisation du stock de sécurité basée sur la variabilité de la demande",
        confidence: Math.random() * 0.15 + 0.85,
      })
    }

    // Suggestion pour la quantité de commande
    if (Math.random() > 0.75) {
      const currentOrderQty = Math.round(product.quantite * 0.3)
      const suggestedOrderQty = Math.round(currentOrderQty * (1 + (Math.random() - 0.5) * 0.5))

      suggestions.push({
        type: "order_quantity",
        productId: product.id,
        productName: product.nom,
        currentValue: currentOrderQty,
        suggestedValue: suggestedOrderQty,
        expectedBenefit: "Optimisation de la quantité de commande pour minimiser les coûts totaux",
        confidence: Math.random() * 0.2 + 0.75,
      })
    }
  })

  return suggestions
}

// Calculer le score de performance d'un produit
export function calculateProductPerformanceScore(product: any, prediction: StockPrediction): number {
  let score = 50 // Score de base

  // Facteur de rotation du stock
  const turnoverRate =
    product.quantite > 0 ? (product.prixUnitaire * 12) / (product.quantite * product.prixUnitaire) : 0
  if (turnoverRate > 6) score += 20
  else if (turnoverRate > 3) score += 10
  else if (turnoverRate < 1) score -= 20

  // Facteur de risque
  switch (prediction.riskLevel) {
    case "low":
      score += 15
      break
    case "medium":
      score += 5
      break
    case "high":
      score -= 15
      break
  }

  // Facteur de confiance de la prédiction
  score += (prediction.confidence - 0.5) * 20

  // Facteur de valeur
  const stockValue = product.quantite * product.prixUnitaire
  if (stockValue > 10000) score += 10
  else if (stockValue < 1000) score -= 5

  return Math.max(0, Math.min(100, Math.round(score)))
}
