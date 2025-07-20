"use client"

import { useState } from "react"
import { Package, TrendingUp, AlertTriangle, DollarSign, Search, Grid3X3, List, Activity, Brain } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AddProductForm } from "./components/add-product-form"
import { EditProductForm } from "./components/edit-product-form"
import { DeleteProductDialog } from "./components/delete-product-dialog"
import { ExportInventory } from "./components/export-inventory"
import { ImportInventory } from "./components/import-inventory"
import { ProductImage } from "./components/product-image"
import { ProductGallery } from "./components/product-gallery"
import { TimeSeriesCharts } from "./components/time-series-charts"
import { StockPredictions } from "./components/stock-predictions"
import { useProducts } from "./hooks/use-products"
import { signOut } from "next-auth/react"

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("")

  // Utilisation du hook personnalisé pour MongoDB
  const {
    products: produits,
    stats,
    categories: categoriesUniques,
    loading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts,
  } = useProducts({ search: searchTerm })

  // Calculs des statistiques (utilise les stats de MongoDB si disponibles)
  const valeurTotaleStock = stats?.valeurTotaleStock || 0
  const nombreTotalProduits = stats?.totalProduits || 0
  const nombreCategories = stats?.nombreCategories || 0
  const produitsEnAlerte = produits.filter((produit) => produit.quantite <= produit.seuilAlerte)

  // Fonction pour ajouter un nouveau produit
  const handleAddProduct = async (newProduct: any) => {
    const success = await createProduct(newProduct)
    if (!success && error) {
      alert(`Erreur lors de l'ajout du produit: ${error}`)
    }
  }

  // Fonction pour modifier un produit
  const handleEditProduct = async (id: string, updatedProduct: any) => {
    const success = await updateProduct(id, updatedProduct)
    if (!success && error) {
      alert(`Erreur lors de la modification du produit: ${error}`)
    }
  }

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (id: string) => {
    const success = await deleteProduct(id)
    if (!success && error) {
      alert(`Erreur lors de la suppression du produit: ${error}`)
    }
  }

  // Fonction pour importer des produits
  const handleImportProducts = async (newProducts: any[]) => {
    const success = await bulkCreateProducts(newProducts)
    if (!success && error) {
      alert(`Erreur lors de l'import: ${error}`)
    }
  }

  // Filtrage des produits pour la vue liste
  const produitsFiltres = produits.filter(
    (produit) =>
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.categorie.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD", // Changé de EUR à MAD
    }).format(amount)
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {" "}
          {/* Added flex-col and md:flex-row */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Dépôt</h1>
            <p className="text-gray-600">Gestion et suivi de votre inventaire avec MongoDB</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {" "}
            {/* Added flex-wrap */}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Actualiser
            </Button>
            <ImportInventory onImportProducts={handleImportProducts} existingProducts={produits} />
            <ExportInventory products={produits} filteredProducts={produitsFiltres} searchTerm={searchTerm} />
            <AddProductForm onAddProduct={handleAddProduct} categories={categoriesUniques} />
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {/* Affichage des erreurs */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto ml-2" onClick={() => refetch()}>
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Cartes de statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Totale Stock</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(valeurTotaleStock)}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Mise à jour..." : "Valeur de tous les produits en stock"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nombreTotalProduits}</div>
              <p className="text-xs text-muted-foreground">Produits uniques en base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nombreCategories}</div>
              <p className="text-xs text-muted-foreground">Types de produits différents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{produitsEnAlerte.length}</div>
              <p className="text-xs text-muted-foreground">Produits sous le seuil d'alerte</p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets pour basculer entre vue liste et galerie */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-2 md:grid-cols-4">
            {" "}
            {/* Changed grid-cols-4 to grid-cols-2 md:grid-cols-4 */}
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Vue Liste
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Vue Galerie
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Évolution
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              IA Prédictions
            </TabsTrigger>
          </TabsList>

          {/* Vue Liste */}
          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {" "}
                  {/* Added flex-col and md:flex-row */}
                  <div>
                    <CardTitle>Inventaire des Produits</CardTitle>
                    <CardDescription>Liste détaillée de tous vos produits en stock (données MongoDB)</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {produitsFiltres.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {produits.length === 0 ? "Aucun produit en base" : "Aucun produit trouvé"}
                    </h3>
                    <p className="text-gray-500">
                      {produits.length === 0
                        ? "Commencez par ajouter des produits à votre inventaire"
                        : "Essayez de modifier vos critères de recherche"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {" "}
                    {/* Added overflow-x-auto */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead className="text-right">Quantité</TableHead>
                          <TableHead className="text-right">Prix Unitaire</TableHead>
                          <TableHead className="text-right">Valeur Totale</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {produitsFiltres.map((produit) => {
                          const valeurTotale = produit.quantite * produit.prixUnitaire
                          const enAlerte = produit.quantite <= produit.seuilAlerte

                          return (
                            <TableRow key={produit.id}>
                              <TableCell className="font-medium">{produit.nom}</TableCell>
                              <TableCell>
                                <ProductImage src={produit.image} alt={produit.nom} productName={produit.nom} />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{produit.categorie}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{produit.quantite}</TableCell>
                              <TableCell className="text-right">{formatCurrency(produit.prixUnitaire)}</TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(valeurTotale)}</TableCell>
                              <TableCell>
                                {enAlerte ? (
                                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                    <AlertTriangle className="w-3 h-3" />
                                    Stock Faible
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    En Stock
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <EditProductForm
                                    product={produit}
                                    onEditProduct={handleEditProduct}
                                    categories={categoriesUniques}
                                  />
                                  <DeleteProductDialog product={produit} onDeleteProduct={handleDeleteProduct} />
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vue Galerie */}
          <TabsContent value="gallery">
            <ProductGallery
              products={produits}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              categories={categoriesUniques}
            />
          </TabsContent>

          {/* Vue Évolution Temporelle */}
          <TabsContent value="timeline">
            <TimeSeriesCharts products={produits} selectedProducts={[]} />
          </TabsContent>

          {/* Vue Prédictions IA */}
          <TabsContent value="predictions">
            <StockPredictions products={produits} selectedProducts={[]} />
          </TabsContent>
        </Tabs>

        {/* Section des alertes si nécessaire */}
        {produitsEnAlerte.length > 0 && (
          <Card className="mt-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertes de Stock Faible
              </CardTitle>
              <CardDescription>Les produits suivants nécessitent un réapprovisionnement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {produitsEnAlerte.map((produit) => (
                  <div key={produit.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <span className="font-medium">{produit.nom}</span>
                      <span className="text-sm text-gray-600 ml-2">({produit.categorie})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-red-600">
                        Stock: {produit.quantite} / Seuil: {produit.seuilAlerte}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques par catégorie si disponibles */}
        {stats?.categoriesStats && stats.categoriesStats.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Répartition par Catégories</CardTitle>
              <CardDescription>Distribution de vos produits et leur valeur par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.categoriesStats.map((catStat) => (
                  <div key={catStat.categorie} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-lg">{catStat.categorie}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Produits:</span>
                        <span className="font-medium">{catStat.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Valeur totale:</span>
                        <span className="font-medium text-green-600">{formatCurrency(catStat.valeurTotale)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
