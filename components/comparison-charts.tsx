"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
}

interface ComparisonChartsProps {
  products: Product[]
}

export function ComparisonCharts({ products }: ComparisonChartsProps) {
  // Données pour le graphique en barres des quantités
  const quantityData = products.map((product) => ({
    nom: product.nom.length > 15 ? product.nom.substring(0, 15) + "..." : product.nom,
    quantite: product.quantite,
    seuilAlerte: product.seuilAlerte,
  }))

  // Données pour le graphique des prix
  const priceData = products.map((product) => ({
    nom: product.nom.length > 15 ? product.nom.substring(0, 15) + "..." : product.nom,
    prixUnitaire: product.prixUnitaire,
  }))

  // Données pour le graphique des valeurs totales
  const valueData = products.map((product) => ({
    nom: product.nom.length > 15 ? product.nom.substring(0, 15) + "..." : product.nom,
    valeurTotale: product.quantite * product.prixUnitaire,
  }))

  // Données pour le graphique en secteurs des catégories
  const categoryData = products.reduce((acc: any[], product) => {
    const existing = acc.find((item) => item.categorie === product.categorie)
    if (existing) {
      existing.count += 1
      existing.valeur += product.quantite * product.prixUnitaire
    } else {
      acc.push({
        categorie: product.categorie,
        count: 1,
        valeur: product.quantite * product.prixUnitaire,
      })
    }
    return acc
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique des quantités */}
      <Card>
        <CardHeader>
          <CardTitle>Quantités en Stock</CardTitle>
          <CardDescription>Comparaison des quantités avec les seuils d'alerte</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quantityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantite" fill="#3B82F6" name="Stock actuel" />
              <Bar dataKey="seuilAlerte" fill="#EF4444" name="Seuil d'alerte" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique des prix */}
      <Card>
        <CardHeader>
          <CardTitle>Prix Unitaires</CardTitle>
          <CardDescription>Comparaison des prix unitaires</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="prixUnitaire" fill="#10B981" name="Prix unitaire" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique des valeurs totales */}
      <Card>
        <CardHeader>
          <CardTitle>Valeurs Totales</CardTitle>
          <CardDescription>Valeur totale de chaque produit en stock</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="valeurTotale" fill="#8B5CF6" name="Valeur totale" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique en secteurs des catégories */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Catégories</CardTitle>
          <CardDescription>Distribution des valeurs par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categorie, percent }) => `${categorie} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valeur"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
