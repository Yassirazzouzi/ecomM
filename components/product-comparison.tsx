"use client"

import { useState } from "react"
import { BarChart3, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ComparisonCharts } from "./comparison-charts"

interface Product {
  id: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
  image?: string
}

interface ProductComparisonProps {
  products: Product[]
}

export function ProductComparison({ products }: ProductComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [comparisonMode, setComparisonMode] = useState<"table" | "charts">("table")

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const selectedProductsData = products.filter((p) => selectedProducts.includes(p.id))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Comparaison des Produits
          </CardTitle>
          <CardDescription>Sélectionnez des produits pour les comparer côte à côte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={comparisonMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setComparisonMode("table")}
            >
              Vue Tableau
            </Button>
            <Button
              variant={comparisonMode === "charts" ? "default" : "outline"}
              size="sm"
              onClick={() => setComparisonMode("charts")}
            >
              Vue Graphiques
            </Button>
          </div>

          {selectedProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Sélectionnez des produits ci-dessous pour commencer la comparaison</p>
            </div>
          )}

          {selectedProducts.length > 0 && comparisonMode === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Critère</th>
                    {selectedProductsData.map((product) => (
                      <th key={product.id} className="text-left p-4 font-medium min-w-[150px]">
                        {product.nom}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Catégorie</td>
                    {selectedProductsData.map((product) => (
                      <td key={product.id} className="p-4">
                        <Badge variant="outline">{product.categorie}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Quantité en stock</td>
                    {selectedProductsData.map((product) => (
                      <td key={product.id} className="p-4">
                        <span className={product.quantite <= product.seuilAlerte ? "text-red-600 font-medium" : ""}>
                          {product.quantite} unités
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Prix unitaire</td>
                    {selectedProductsData.map((product) => (
                      <td key={product.id} className="p-4 font-medium">
                        {formatCurrency(product.prixUnitaire)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Valeur totale</td>
                    {selectedProductsData.map((product) => (
                      <td key={product.id} className="p-4 font-bold text-green-600">
                        {formatCurrency(product.quantite * product.prixUnitaire)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Seuil d'alerte</td>
                    {selectedProductsData.map((product) => (
                      <td key={product.id} className="p-4">
                        {product.seuilAlerte} unités
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Statut</td>
                    {selectedProductsData.map((product) => (
                      <td key={product.id} className="p-4">
                        {product.quantite <= product.seuilAlerte ? (
                          <Badge variant="destructive">Stock Faible</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">En Stock</Badge>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {selectedProducts.length > 0 && comparisonMode === "charts" && (
            <ComparisonCharts products={selectedProductsData} />
          )}
        </CardContent>
      </Card>

      {/* Liste des produits pour sélection */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner les produits à comparer</CardTitle>
          <CardDescription>
            Cochez les produits que vous souhaitez comparer ({selectedProducts.length} sélectionnés)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id)
              const valeurTotale = product.quantite * product.prixUnitaire

              return (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleProductToggle(product.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => handleProductToggle(product.id)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{product.nom}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.categorie}
                        </Badge>
                        {product.quantite <= product.seuilAlerte && (
                          <Badge variant="destructive" className="text-xs">
                            Alerte
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Stock:</span>
                          <span>{product.quantite}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prix:</span>
                          <span>{formatCurrency(product.prixUnitaire)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-green-600">
                          <span>Valeur:</span>
                          <span>{formatCurrency(valeurTotale)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
