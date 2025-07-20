"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { generateHistoricalData, generateTrendData, calculatePerformanceStats } from "@/lib/historical-data"

interface Product {
  id: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
}

interface TimeSeriesChartsProps {
  products: Product[]
  selectedProducts: string[]
}

export function TimeSeriesCharts({ products, selectedProducts }: TimeSeriesChartsProps) {
  const [timeRange, setTimeRange] = useState("12")
  const [chartType, setChartType] = useState<"quantity" | "value" | "movements">("quantity")

  // Générer les données historiques
  const historicalData = useMemo(() => {
    return generateHistoricalData(products, Number.parseInt(timeRange))
  }, [products, timeRange])

  // Générer les données de tendances
  const trendData = useMemo(() => {
    return generateTrendData(products)
  }, [products])

  // Calculer les statistiques de performance
  const performanceStats = useMemo(() => {
    return calculatePerformanceStats(historicalData)
  }, [historicalData])

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    if (historicalData.length === 0) return []

    // Obtenir toutes les dates uniques
    const allDates = [...new Set(historicalData.flatMap((p) => p.data.map((d) => d.date)))].sort()

    return allDates.map((date) => {
      const dataPoint: any = { date: new Date(date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) }

      historicalData.forEach((productHistory) => {
        const point = productHistory.data.find((d) => d.date === date)
        if (point) {
          const key =
            productHistory.productName.length > 20
              ? productHistory.productName.substring(0, 20) + "..."
              : productHistory.productName

          switch (chartType) {
            case "quantity":
              dataPoint[key] = point.quantite
              break
            case "value":
              dataPoint[key] = point.valeur
              break
            case "movements":
              dataPoint[key] = point.mouvements
              break
          }
        }
      })

      return dataPoint
    })
  }, [historicalData, chartType])

  const formatValue = (value: number) => {
    switch (chartType) {
      case "quantity":
        return `${value} unités`
      case "value":
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
        }).format(value)
      case "movements":
        return `${value} mvts`
      default:
        return value.toString()
    }
  }

  const getChartTitle = () => {
    switch (chartType) {
      case "quantity":
        return "Évolution des Quantités en Stock"
      case "value":
        return "Évolution de la Valeur du Stock"
      case "movements":
        return "Mouvements de Stock"
      default:
        return "Évolution Temporelle"
    }
  }

  const getChartDescription = () => {
    switch (chartType) {
      case "quantity":
        return "Suivi des quantités en stock sur la période sélectionnée"
      case "value":
        return "Évolution de la valeur monétaire du stock"
      case "movements":
        return "Nombre de mouvements (entrées/sorties) par période"
      default:
        return "Données temporelles"
    }
  }

  const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"]

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Analyse Temporelle
          </CardTitle>
          <CardDescription>Visualisez l'évolution de vos stocks dans le temps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 derniers mois</SelectItem>
                <SelectItem value="6">6 derniers mois</SelectItem>
                <SelectItem value="12">12 derniers mois</SelectItem>
                <SelectItem value="24">24 derniers mois</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={chartType}
              onValueChange={(value: "quantity" | "value" | "movements") => setChartType(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de données" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Quantités</SelectItem>
                <SelectItem value="value">Valeurs</SelectItem>
                <SelectItem value="movements">Mouvements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceStats.slice(0, 6).map((stat, index) => (
          <Card key={stat.productId}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{stat.productName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {stat.quantityChange > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${stat.quantityChange > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {stat.quantityChange > 0 ? "+" : ""}
                      {stat.quantityChange}%
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stat.movementTotal} mvts
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique principal */}
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>{getChartDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "movements" ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatValue(value)} />
                <Tooltip formatter={(value) => formatValue(Number(value))} />
                {historicalData.slice(0, 6).map((productHistory, index) => {
                  const key =
                    productHistory.productName.length > 20
                      ? productHistory.productName.substring(0, 20) + "..."
                      : productHistory.productName
                  return (
                    <Area
                      key={productHistory.productId}
                      type="monotone"
                      dataKey={key}
                      stackId="1"
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.6}
                    />
                  )
                })}
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatValue(value)} />
                <Tooltip formatter={(value) => formatValue(Number(value))} />
                {historicalData.slice(0, 6).map((productHistory, index) => {
                  const key =
                    productHistory.productName.length > 20
                      ? productHistory.productName.substring(0, 20) + "..."
                      : productHistory.productName
                  return (
                    <Line
                      key={productHistory.productId}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )
                })}
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendances par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances par Catégorie</CardTitle>
          <CardDescription>Analyse des tendances par type de produit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              trendData.reduce((acc: any, item) => {
                if (!acc[item.category]) {
                  acc[item.category] = { up: 0, down: 0, total: 0 }
                }
                acc[item.category][item.trend]++
                acc[item.category].total++
                return acc
              }, {}),
            ).map(([category, stats]: [string, any]) => (
              <div key={category} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{category}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      En hausse
                    </span>
                    <span className="font-medium">{stats.up}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-red-600" />
                      En baisse
                    </span>
                    <span className="font-medium">{stats.down}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total produits</span>
                      <span>{stats.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
