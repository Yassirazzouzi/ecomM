// Simulation de données historiques pour les graphiques temporels
export interface HistoricalDataPoint {
  date: string
  quantite: number
  valeur: number
  mouvements: number
}

export interface ProductHistory {
  productId: string
  productName: string
  data: HistoricalDataPoint[]
}

// Générer des données historiques simulées
export function generateHistoricalData(products: any[], months = 12): ProductHistory[] {
  const now = new Date()

  return products.map((product) => {
    const data: HistoricalDataPoint[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const dateString = date.toISOString().split("T")[0]

      // Simulation de variations de stock
      const baseQuantity = product.quantite
      const variation = Math.random() * 0.4 - 0.2 // ±20% de variation
      const quantite = Math.max(0, Math.floor(baseQuantity * (1 + variation)))

      // Simulation de mouvements (entrées/sorties)
      const mouvements = Math.floor(Math.random() * 50) + 10

      data.push({
        date: dateString,
        quantite,
        valeur: quantite * product.prixUnitaire,
        mouvements,
      })
    }

    return {
      productId: product.id,
      productName: product.nom,
      data,
    }
  })
}

// Générer des données de tendances
export function generateTrendData(products: any[]) {
  return products.map((product) => {
    const trend = Math.random() > 0.5 ? "up" : "down"
    const percentage = Math.random() * 20 + 5 // 5-25%

    return {
      productId: product.id,
      productName: product.nom,
      trend,
      percentage: Number(percentage.toFixed(1)),
      category: product.categorie,
    }
  })
}

// Calculer les statistiques de performance
export function calculatePerformanceStats(historicalData: ProductHistory[]) {
  return historicalData.map((productHistory) => {
    const data = productHistory.data
    const latest = data[data.length - 1]
    const previous = data[data.length - 2]

    if (!previous) {
      return {
        productId: productHistory.productId,
        productName: productHistory.productName,
        quantityChange: 0,
        valueChange: 0,
        movementTotal: latest.mouvements,
      }
    }

    const quantityChange = ((latest.quantite - previous.quantite) / previous.quantite) * 100
    const valueChange = ((latest.valeur - previous.valeur) / previous.valeur) * 100
    const movementTotal = data.reduce((sum, point) => sum + point.mouvements, 0)

    return {
      productId: productHistory.productId,
      productName: productHistory.productName,
      quantityChange: Number(quantityChange.toFixed(1)),
      valueChange: Number(valueChange.toFixed(1)),
      movementTotal,
    }
  })
}
