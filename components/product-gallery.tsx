"use client"

import { useState } from "react"
import { Search, Filter, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditProductForm } from "./edit-product-form"
import { DeleteProductDialog } from "./delete-product-dialog"

interface Product {
  id: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
  seuilAlerte: number
  image?: string
}

interface ProductGalleryProps {
  products: Product[]
  onEditProduct: (id: string, product: Omit<Product, "id">) => void
  onDeleteProduct: (id: string) => void
  categories: string[]
}

export function ProductGallery({ products, onEditProduct, onDeleteProduct, categories }: ProductGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("nom")

  // Filtrage et tri des produits
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch =
        product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categorie.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.categorie === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "nom":
          return a.nom.localeCompare(b.nom)
        case "prix":
          return a.prixUnitaire - b.prixUnitaire
        case "quantite":
          return b.quantite - a.quantite
        case "valeur":
          return b.quantite * b.prixUnitaire - a.quantite * a.prixUnitaire
        default:
          return 0
      }
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Galerie des Produits</CardTitle>
          <CardDescription>Vue en grille de tous vos produits avec images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {" "}
            {/* Ensured flex-col for mobile */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {" "}
              {/* Added flex-col sm:flex-row for selects */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  {" "}
                  {/* Adjusted width for mobile */}
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  {" "}
                  {/* Adjusted width for mobile */}
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nom">Nom</SelectItem>
                  <SelectItem value="prix">Prix</SelectItem>
                  <SelectItem value="quantite">Quantité</SelectItem>
                  <SelectItem value="valeur">Valeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille des produits */}
      {filteredAndSortedProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter des produits à votre inventaire"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {" "}
          {/* Adjusted grid-cols for sm screens */}
          {filteredAndSortedProducts.map((product) => {
            const valeurTotale = product.quantite * product.prixUnitaire
            const enAlerte = product.quantite <= product.seuilAlerte

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {enAlerte ? (
                      <Badge variant="destructive" className="text-xs">
                        Stock Faible
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        En Stock
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg truncate" title={product.nom}>
                        {product.nom}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {product.categorie}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Quantité:</span>
                        <p className={`font-medium ${enAlerte ? "text-red-600" : ""}`}>{product.quantite}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Prix unitaire:</span>
                        <p className="font-medium">{formatCurrency(product.prixUnitaire)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Valeur totale:</span>
                        <span className="font-bold text-green-600">{formatCurrency(valeurTotale)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <EditProductForm product={product} onEditProduct={onEditProduct} categories={categories} />
                      <DeleteProductDialog product={product} onDeleteProduct={onDeleteProduct} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Statistiques de la vue */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{filteredAndSortedProducts.length}</p>
              <p className="text-sm text-gray-600">Produits affichés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(filteredAndSortedProducts.reduce((total, p) => total + p.quantite * p.prixUnitaire, 0))}
              </p>
              <p className="text-sm text-gray-600">Valeur totale</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {filteredAndSortedProducts.filter((p) => p.quantite <= p.seuilAlerte).length}
              </p>
              <p className="text-sm text-gray-600">En alerte</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(filteredAndSortedProducts.map((p) => p.categorie)).size}
              </p>
              <p className="text-sm text-gray-600">Catégories</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  gridSize: "1" | "2" | "3" | "4"
  onViewDetails: (product: Product) => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (product: Product) => void
}

function ProductCard({
  product,
  gridSize,
  onViewDetails,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection(product)
    } else {
      onViewDetails(product)
    }
  }

  const valeurTotale = product.quantite * product.prixUnitaire
  const enAlerte = product.quantite <= product.seuilAlerte

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
        isSelected ? "border-2 border-blue-500" : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div className="aspect-square relative bg-gray-100">
        {product.image ? (
          <img src={product.image || "/placeholder.svg"} alt={product.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {enAlerte ? (
            <Badge variant="destructive" className="text-xs">
              Stock Faible
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              En Stock
            </Badge>
          )}
        </div>
        {isSelectionMode && (
          <div className="absolute top-2 left-2">
            <div className="rounded-full bg-white/80 backdrop-blur-sm w-6 h-6 flex items-center justify-center">
              {isSelected ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-blue-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 010 1.061l-11.25 11.25a.75.75 0 01-1.061 0l-5.25-5.25a.75.75 0 011.061-1.061L8.25 15.75l10.66-10.66a.75.75 0 011.062 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-400"></div>
              )}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg truncate" title={product.nom}>
              {product.nom}
            </h3>
            <Badge variant="outline" className="text-xs">
              {product.categorie}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Quantité:</span>
              <p className={`font-medium ${enAlerte ? "text-red-600" : ""}`}>{product.quantite}</p>
            </div>
            <div>
              <span className="text-gray-600">Prix unitaire:</span>
              <p className="font-medium">{formatCurrency(product.prixUnitaire)}</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valeur totale:</span>
              <span className="font-bold text-green-600">{formatCurrency(valeurTotale)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string, product: Omit<Product, "id">) => void
  onDelete: (id: string) => void
}

function ProductDetailsModal({ product, isOpen, onClose, onEdit, onDelete }: ProductDetailsModalProps) {
  if (!product) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  const valeurTotale = product.quantite * product.prixUnitaire
  const enAlerte = product.quantite <= product.seuilAlerte

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? "block" : "hidden"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <Package className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Détails du Produit
                </h3>
              </div>
            </div>
            <div className="mt-2">
              <dl className="divide-y divide-gray-200">
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{product.nom}</dd>
                </div>
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Catégorie</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{product.categorie}</dd>
                </div>
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Quantité</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{product.quantite}</dd>
                </div>
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Prix Unitaire</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(product.prixUnitaire)}</dd>
                </div>
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Seuil d'Alerte</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{product.seuilAlerte}</dd>
                </div>
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Valeur Totale</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(valeurTotale)}</dd>
                </div>
                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-medium text-gray-500">Statut du Stock</dt>
                  <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                    {enAlerte ? (
                      <Badge variant="destructive" className="text-xs">
                        Stock Faible
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        En Stock
                      </Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <DeleteProductDialog product={product} onDelete={onDelete} />
            <EditProductForm product={product} onEditProduct={onEdit} />
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ProductCard, ProductDetailsModal }
