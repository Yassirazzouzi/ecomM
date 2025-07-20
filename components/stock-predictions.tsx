"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, TrendingDown, CheckCircle, Target, Lightbulb, BarChart3 } from "lucide-react"
import {
  generateStockPredictions,
  generateMarketTrends,
  generateOptimizationSuggestions,
  calculateProductPerformanceScore,
} from "@/lib/ai-predictions"

interface Product {
  id: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
}

interface StockPredictionsProps {
  products: Product[]
  selectedProducts: string[]
}

export function StockPredictions({ products, selectedProducts }: StockPredictionsProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [predictionHorizon, setPredictionHorizon] = useState("6")

  // Générer les prédictions IA
  const predictions = useMemo(() => {
    return generateStockPredictions(products)
  }, [products])

  // Générer les tendances de marché
  const marketTrends = useMemo(() => {
    return generateMarketTrends(products)
  }, [products])

  // Générer les suggestions d'optimisation
  const optimizationSuggestions = useMemo(() => {
    return generateOptimizationSuggestions(products)
  }, [products])

  // Calculer les scores de performance
  const performanceScores = useMemo(() => {
    return products
      .map((product) => {
        const prediction = predictions.find((p) => p.productId === product.id)
        return {
          productId: product.id,
          productName: product.nom,
          score: prediction ? calculateProductPerformanceScore(product, prediction) : 50,
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [products, predictions])

  // Préparer les données pour le graphique de prédiction
  const selectedPrediction = predictions.find((p) => p.productId === selectedProduct)
  const predictionChartData = selectedPrediction
    ? selectedPrediction.dates.map((date, index) => ({
        date: new Date(date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        stock: selectedPrediction.predictedStock[index],
        seuil: products.find((p) => p.id === selectedProduct)?.seuilAlerte || 0,
      }))
    : []

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "restock":
        return <TrendingUp className="w-4 h-4" />
      case "reduce":
        return <TrendingDown className="w-4 h-4" />
      case "maintain":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "restock":
        return "text-blue-600"
      case "reduce":
        return "text-orange-600"
      case "maintain":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Prédictions IA & Optimisation
          </CardTitle>
          <CardDescription>
            Analyse prédictive basée sur l'intelligence artificielle pour optimiser votre gestion de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Les prédictions sont basées sur l'analyse des tendances historiques, la saisonnalité et les patterns de
              consommation. Confiance moyenne:{" "}
              {Math.round((predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length) * 100)}%
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Onglet Prédictions */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Contrôles */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={predictionHorizon} onValueChange={setPredictionHorizon}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 mois</SelectItem>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Graphique de prédiction */}
          {selectedPrediction && (
            <Card>
              <CardHeader>
                <CardTitle>Prédiction de Stock - {selectedPrediction.productName}</CardTitle>
                <CardDescription>
                  Évolution prévue du stock avec un niveau de confiance de{" "}
                  {(selectedPrediction.confidence * 100).toFixed(0)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="stock" stroke="#3B82F6" strokeWidth={3} name="Stock prévu" />
                    <Line
                      type="monotone"
                      dataKey="seuil"
                      stroke="#EF4444"
                      strokeDasharray="5 5"
                      name="Seuil d'alerte"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getRecommendationIcon(selectedPrediction.recommendation)}
                    <span className={`font-medium ${getRecommendationColor(selectedPrediction.recommendation)}`}>
                      Recommandation:{" "}
                      {selectedPrediction.recommendation === "restock"
                        ? "Réapprovisionner"
                        : selectedPrediction.recommendation === "reduce"
                          ? "Réduire"
                          : "Maintenir"}
                    </span>
                    <Badge variant={getRiskBadgeColor(selectedPrediction.riskLevel)}>
                      Risque {selectedPrediction.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{selectedPrediction.recommendationReason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résumé des prédictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.slice(0, 6).map((prediction) => (
              <Card
                key={prediction.productId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProduct(prediction.productId)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium truncate flex-1">{prediction.productName}</h4>
                      <Badge variant={getRiskBadgeColor(prediction.riskLevel)} className="ml-2">
                        {prediction.riskLevel}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock actuel:</span>
                        <span className="font-medium">{prediction.currentStock}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stock prévu (6 mois):</span>
                        <span className="font-medium">{prediction.predictedStock[5]}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Confiance:</span>
                        <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      {getRecommendationIcon(prediction.recommendation)}
                      <span className={`text-sm font-medium ${getRecommendationColor(prediction.recommendation)}`}>
                        {prediction.recommendation === "restock"
                          ? "Réapprovisionner"
                          : prediction.recommendation === "reduce"
                            ? "Réduire"
                            : "Maintenir"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Tendances */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendances de Marché par Catégorie</CardTitle>
              <CardDescription>Analyse des tendances sectorielles basée sur les données de marché</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketTrends.map((trend) => (
                  <div key={trend.category} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{trend.category}</h4>
                      <Badge
                        variant={
                          trend.trend === "growing"
                            ? "default"
                            : trend.trend === "declining"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {trend.trend === "growing" ? "Croissance" : trend.trend === "declining" ? "Déclin" : "Stable"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux de croissance:</span>
                        <span
                          className={`font-medium ${
                            trend.growthRate > 0
                              ? "text-green-600"
                              : trend.growthRate < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {trend.growthRate > 0 ? "+" : ""}
                          {trend.growthRate}%
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Saisonnalité:</span>
                        <span className="font-medium">{trend.seasonality ? "Oui" : "Non"}</span>
                      </div>

                      {trend.seasonality && trend.peakMonths.length > 0 && (
                        <div className="text-sm">
                          <span>Pics: </span>
                          <span className="font-medium">
                            {trend.peakMonths
                              .map((month) => new Date(2024, month, 1).toLocaleDateString("fr-FR", { month: "short" }))
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Optimisation */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggestions d'Optimisation</CardTitle>
              <CardDescription>Recommandations IA pour améliorer votre gestion de stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{suggestion.productName}</h4>
                        <p className="text-sm text-gray-600 capitalize">{suggestion.type.replace("_", " ")}</p>
                      </div>
                      <Badge variant="outline">{(suggestion.confidence * 100).toFixed(0)}% confiance</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Valeur actuelle:</span>
                        <p className="font-medium">{suggestion.currentValue}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Valeur suggérée:</span>
                        <p className="font-medium text-blue-600">{suggestion.suggestedValue}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{suggestion.expectedBenefit}</p>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        Appliquer
                      </Button>
                      <Button size="sm" variant="ghost">
                        Plus d'infos
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Performance */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Scores de Performance
              </CardTitle>
              <CardDescription>Évaluation de la performance de chaque produit basée sur l'IA</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceScores.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} interval={0} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3B82F6" name="Score de performance" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceScores.slice(0, 6).map((score) => (
                  <div key={score.productId} className="p-4 border rounded-lg">
                    <h4 className="font-medium truncate mb-2">{score.productName}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            score.score >= 80 ? "bg-green-500" : score.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${score.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm">{score.score}/100</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {score.score >= 80 ? "Excellent" : score.score >= 60 ? "Bon" : "À améliorer"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
