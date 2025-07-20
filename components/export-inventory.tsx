"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Product {
  id: string
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

interface ExportInventoryProps {
  products: Product[]
  filteredProducts: Product[]
  searchTerm: string
}

export function ExportInventory({ products, filteredProducts, searchTerm }: ExportInventoryProps) {
  const [isExporting, setIsExporting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  const exportToCSV = (data: Product[], filename: string) => {
    setIsExporting(true)

    try {
      const headers = [
        "ID",
        "Nom",
        "Catégorie",
        "Quantité",
        "Prix Unitaire (€)",
        "Valeur Totale (€)",
        "Seuil d'Alerte",
        "Statut",
        "Fournisseur",
        "Référence",
        "Description",
        "Emplacement",
        "Date Création",
        "Date Modification",
      ]

      const csvContent = [
        headers.join(","),
        ...data.map((product) => {
          const valeurTotale = product.quantite * product.prixUnitaire
          const statut = product.quantite <= product.seuilAlerte ? "Stock Faible" : "En Stock"

          return [
            product.id,
            `"${product.nom}"`,
            `"${product.categorie}"`,
            product.quantite,
            product.prixUnitaire,
            valeurTotale,
            product.seuilAlerte,
            `"${statut}"`,
            `"${product.metadata?.fournisseur || ""}"`,
            `"${product.metadata?.reference || ""}"`,
            `"${product.metadata?.description || ""}"`,
            `"${product.metadata?.emplacement || ""}"`,
            product.dateCreation ? new Date(product.dateCreation).toLocaleDateString("fr-FR") : "",
            product.dateModification ? new Date(product.dateModification).toLocaleDateString("fr-FR") : "",
          ].join(",")
        }),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error)
      alert("Erreur lors de l'export CSV")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = (data: Product[], filename: string) => {
    setIsExporting(true)

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalProducts: data.length,
        totalValue: data.reduce((sum, p) => sum + p.quantite * p.prixUnitaire, 0),
        searchTerm: searchTerm || null,
        products: data.map((product) => ({
          ...product,
          valeurTotale: product.quantite * product.prixUnitaire,
          statut: product.quantite <= product.seuilAlerte ? "Stock Faible" : "En Stock",
        })),
      }

      const jsonContent = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors de l'export JSON:", error)
      alert("Erreur lors de l'export JSON")
    } finally {
      setIsExporting(false)
    }
  }

  const generateReport = (data: Product[]) => {
    const totalValue = data.reduce((sum, p) => sum + p.quantite * p.prixUnitaire, 0)
    const alertProducts = data.filter((p) => p.quantite <= p.seuilAlerte)
    const categories = [...new Set(data.map((p) => p.categorie))]

    const categoryStats = categories.map((cat) => {
      const catProducts = data.filter((p) => p.categorie === cat)
      return {
        categorie: cat,
        count: catProducts.length,
        valeur: catProducts.reduce((sum, p) => sum + p.quantite * p.prixUnitaire, 0),
      }
    })

    const reportContent = `
RAPPORT D'INVENTAIRE
====================

Date du rapport: ${new Date().toLocaleDateString("fr-FR")}
${searchTerm ? `Filtre appliqué: "${searchTerm}"` : "Inventaire complet"}

STATISTIQUES GÉNÉRALES
----------------------
Nombre total de produits: ${data.length}
Valeur totale du stock: ${formatCurrency(totalValue)}
Produits en alerte: ${alertProducts.length}
Nombre de catégories: ${categories.length}

RÉPARTITION PAR CATÉGORIES
--------------------------
${categoryStats.map((stat) => `${stat.categorie}: ${stat.count} produits (${formatCurrency(stat.valeur)})`).join("\n")}

PRODUITS EN ALERTE DE STOCK
---------------------------
${
  alertProducts.length > 0
    ? alertProducts.map((p) => `- ${p.nom} (${p.categorie}): ${p.quantite}/${p.seuilAlerte}`).join("\n")
    : "Aucun produit en alerte"
}

DÉTAIL DES PRODUITS
-------------------
${data
  .map(
    (product) => `
${product.nom}
  Catégorie: ${product.categorie}
  Quantité: ${product.quantite}
  Prix unitaire: ${formatCurrency(product.prixUnitaire)}
  Valeur totale: ${formatCurrency(product.quantite * product.prixUnitaire)}
  Seuil d'alerte: ${product.seuilAlerte}
  Statut: ${product.quantite <= product.seuilAlerte ? "ALERTE" : "OK"}
  ${product.metadata?.fournisseur ? `Fournisseur: ${product.metadata.fournisseur}` : ""}
  ${product.metadata?.reference ? `Référence: ${product.metadata.reference}` : ""}
  ${product.metadata?.emplacement ? `Emplacement: ${product.metadata.emplacement}` : ""}
`,
  )
  .join("\n")}
`

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `rapport-inventaire-${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const handleExportAll = (format: "csv" | "json" | "report") => {
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `inventaire-complet-${timestamp}`

    switch (format) {
      case "csv":
        exportToCSV(products, `${filename}.csv`)
        break
      case "json":
        exportToJSON(products, `${filename}.json`)
        break
      case "report":
        generateReport(products)
        break
    }
  }

  const handleExportFiltered = (format: "csv" | "json" | "report") => {
    const timestamp = new Date().toISOString().split("T")[0]
    const searchSuffix = searchTerm ? `-${searchTerm.replace(/[^a-zA-Z0-9]/g, "-")}` : "-filtre"
    const filename = `inventaire${searchSuffix}-${timestamp}`

    switch (format) {
      case "csv":
        exportToCSV(filteredProducts, `${filename}.csv`)
        break
      case "json":
        exportToJSON(filteredProducts, `${filename}.json`)
        break
      case "report":
        generateReport(filteredProducts)
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Export en cours..." : "Exporter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
          Inventaire complet ({products.length} produits)
        </div>
        <DropdownMenuItem onClick={() => handleExportAll("csv")}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAll("json")}>
          <FileText className="w-4 h-4 mr-2" />
          Export JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAll("report")}>
          <FileText className="w-4 h-4 mr-2" />
          Rapport détaillé
        </DropdownMenuItem>

        {(searchTerm || filteredProducts.length !== products.length) && (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 border-t mt-1 pt-2">
              Vue actuelle ({filteredProducts.length} produits)
            </div>
            <DropdownMenuItem onClick={() => handleExportFiltered("csv")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV filtré
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFiltered("json")}>
              <FileText className="w-4 h-4 mr-2" />
              Export JSON filtré
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFiltered("report")}>
              <FileText className="w-4 h-4 mr-2" />
              Rapport filtré
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
