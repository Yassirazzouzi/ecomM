"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Product {
  id: string
  nom: string
  categorie: string
  quantite: number
  prixUnitaire: number
}

interface DeleteProductDialogProps {
  product: Product
  onDeleteProduct: (id: string) => void
}

export function DeleteProductDialog({ product, onDeleteProduct }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    onDeleteProduct(product.id)
    setOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
    }).format(amount)
  }

  const valeurTotale = product.quantite * product.prixUnitaire

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Êtes-vous sûr de vouloir supprimer définitivement ce produit de votre inventaire ?</p>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="font-medium">{product.nom}</div>
                <div className="text-sm text-gray-600">
                  <div>Catégorie: {product.categorie}</div>
                  <div>Quantité en stock: {product.quantite}</div>
                  <div>Prix unitaire: {formatCurrency(product.prixUnitaire)}</div>
                  <div className="font-medium text-red-600">Valeur totale perdue: {formatCurrency(valeurTotale)}</div>
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">
                Cette action est irréversible et supprimera toutes les données associées à ce produit.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
