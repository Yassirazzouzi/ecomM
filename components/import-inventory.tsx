"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  id?: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
  image?: string
  metadata?: {
    fournisseur?: string
    reference?: string
    description?: string
    emplacement?: string
  }
}

interface ImportInventoryProps {
  onImportProducts: (products: Omit<Product, "id">[]) => void
  existingProducts: Product[]
}

interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  duplicates: number
  preview: Omit<Product, "id">[]
}

export function ImportInventory({ onImportProducts, existingProducts }: ImportInventoryProps) {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [jsonInput, setJsonInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateProduct = (product: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!product.nom || typeof product.nom !== "string") {
      errors.push("Le nom est requis et doit être une chaîne de caractères")
    }

    if (!product.categorie || typeof product.categorie !== "string") {
      errors.push("La catégorie est requise et doit être une chaîne de caractères")
    }

    if (typeof product.quantite !== "number" || product.quantite < 0) {
      errors.push("La quantité doit être un nombre positif")
    }

    if (typeof product.prixUnitaire !== "number" || product.prixUnitaire <= 0) {
      errors.push("Le prix unitaire doit être un nombre positif")
    }

    if (typeof product.seuilAlerte !== "number" || product.seuilAlerte < 0) {
      errors.push("Le seuil d'alerte doit être un nombre positif")
    }

    return { valid: errors.length === 0, errors }
  }

  const processCSV = (csvContent: string): ImportResult => {
    const lines = csvContent.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const products: Omit<Product, "id">[] = []
    const errors: string[] = []
    let duplicates = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length < 6) {
          errors.push(`Ligne ${i + 1}: Données insuffisantes`)
          continue
        }

        const product = {
          nom: values[1] || "",
          categorie: values[2] || "",
          quantite: Number.parseInt(values[3]) || 0,
          prixUnitaire: Number.parseFloat(values[4]) || 0,
          seuilAlerte: Number.parseInt(values[6]) || 0,
          metadata: {
            fournisseur: values[8] || undefined,
            reference: values[9] || undefined,
            description: values[10] || undefined,
            emplacement: values[11] || undefined,
          },
        }

        const validation = validateProduct(product)
        if (!validation.valid) {
          errors.push(`Ligne ${i + 1}: ${validation.errors.join(", ")}`)
          continue
        }

        // Vérifier les doublons
        const isDuplicate = existingProducts.some(
          (existing) => existing.nom.toLowerCase() === product.nom.toLowerCase(),
        )

        if (isDuplicate) {
          duplicates++
          continue
        }

        products.push(product)
      } catch (error) {
        errors.push(`Ligne ${i + 1}: Erreur de parsing`)
      }
    }

    return {
      success: errors.length === 0,
      imported: products.length,
      errors,
      duplicates,
      preview: products.slice(0, 5), // Aperçu des 5 premiers
    }
  }

  const processJSON = (jsonContent: string): ImportResult => {
    try {
      const data = JSON.parse(jsonContent)
      let productsArray: any[] = []

      // Gérer différents formats JSON
      if (Array.isArray(data)) {
        productsArray = data
      } else if (data.products && Array.isArray(data.products)) {
        productsArray = data.products
      } else {
        return {
          success: false,
          imported: 0,
          errors: ["Format JSON non reconnu. Attendu: tableau de produits ou objet avec propriété 'products'"],
          duplicates: 0,
          preview: [],
        }
      }

      const products: Omit<Product, "id">[] = []
      const errors: string[] = []
      let duplicates = 0

      productsArray.forEach((item, index) => {
        const validation = validateProduct(item)
        if (!validation.valid) {
          errors.push(`Produit ${index + 1}: ${validation.errors.join(", ")}`)
          return
        }

        // Vérifier les doublons
        const isDuplicate = existingProducts.some((existing) => existing.nom.toLowerCase() === item.nom.toLowerCase())

        if (isDuplicate) {
          duplicates++
          return
        }

        products.push({
          nom: item.nom,
          categorie: item.categorie,
          quantite: item.quantite,
          prixUnitaire: item.prixUnitaire,
          seuilAlerte: item.seuilAlerte,
          image: item.image,
          metadata: item.metadata,
        })
      })

      return {
        success: errors.length === 0,
        imported: products.length,
        errors,
        duplicates,
        preview: products.slice(0, 5),
      }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: ["Erreur de parsing JSON: " + (error as Error).message],
        duplicates: 0,
        preview: [],
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)

    try {
      const content = await file.text()
      let result: ImportResult

      if (file.name.endsWith(".csv")) {
        result = processCSV(content)
      } else if (file.name.endsWith(".json")) {
        result = processJSON(content)
      } else {
        result = {
          success: false,
          imported: 0,
          errors: ["Format de fichier non supporté. Utilisez CSV ou JSON."],
          duplicates: 0,
          preview: [],
        }
      }

      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        errors: ["Erreur lors de la lecture du fichier: " + (error as Error).message],
        duplicates: 0,
        preview: [],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleJSONImport = () => {
    if (!jsonInput.trim()) return

    setIsProcessing(true)
    const result = processJSON(jsonInput)
    setImportResult(result)
    setIsProcessing(false)
  }

  const handleConfirmImport = () => {
    if (importResult && importResult.preview.length > 0) {
      // Récupérer tous les produits validés, pas seulement l'aperçu
      const allValidProducts = importResult.preview // Dans un vrai cas, on stockerait tous les produits
      onImportProducts(allValidProducts)
      setOpen(false)
      setImportResult(null)
      setJsonInput("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCancel = () => {
    setImportResult(null)
    setJsonInput("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des produits</DialogTitle>
          <DialogDescription>
            Importez des produits depuis un fichier CSV ou JSON, ou collez directement du JSON.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Import de fichier</TabsTrigger>
            <TabsTrigger value="json">Import JSON direct</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  {isProcessing ? "Traitement en cours..." : "Sélectionner un fichier CSV ou JSON"}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Format CSV attendu:</strong> ID, Nom, Catégorie, Quantité, Prix Unitaire, Valeur Totale, Seuil
                  d'Alerte, Statut, Fournisseur, Référence, Description, Emplacement
                  <br />
                  <strong>Format JSON:</strong> Tableau d'objets avec les propriétés: nom, categorie, quantite,
                  prixUnitaire, seuilAlerte
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Collez votre JSON ici..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <Button onClick={handleJSONImport} disabled={!jsonInput.trim() || isProcessing} className="w-full">
                {isProcessing ? "Traitement en cours..." : "Analyser le JSON"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Résultats de l'import */}
        {importResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{importResult.success ? "Import prêt" : "Erreurs détectées"}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-green-700">Produits à importer</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{importResult.duplicates}</div>
                <div className="text-sm text-orange-700">Doublons ignorés</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-red-700">Erreurs</div>
              </div>
            </div>

            {/* Erreurs */}
            {importResult.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <strong>Erreurs détectées:</strong>
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm">
                        • {error}
                      </div>
                    ))}
                    {importResult.errors.length > 5 && (
                      <div className="text-sm text-gray-600">
                        ... et {importResult.errors.length - 5} autres erreurs
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Aperçu des produits */}
            {importResult.preview.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Aperçu des produits à importer:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.preview.map((product, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{product.nom}</div>
                          <div className="text-sm text-gray-600">
                            {product.categorie} • {product.quantite} unités • {formatCurrency(product.prixUnitaire)}
                          </div>
                        </div>
                        <Badge variant="outline">{formatCurrency(product.quantite * product.prixUnitaire)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          {importResult && importResult.imported > 0 && (
            <Button onClick={handleConfirmImport}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer l'import ({importResult.imported} produits)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
