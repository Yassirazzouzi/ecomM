"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ImageUpload } from "./image-upload"

interface AddProductFormProps {
  onAddProduct: (product: any) => void
  categories: string[]
}

export function AddProductForm({ onAddProduct, categories }: AddProductFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    quantite: "",
    prixUnitaire: "",
    seuilAlerte: "",
    image: "",
    metadata: {
      fournisseur: "",
      reference: "",
      description: "",
      emplacement: "",
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const product = {
      nom: formData.nom,
      categorie: formData.categorie,
      quantite: Number.parseInt(formData.quantite),
      prixUnitaire: Number.parseFloat(formData.prixUnitaire),
      seuilAlerte: Number.parseInt(formData.seuilAlerte),
      image: formData.image || undefined,
      metadata: {
        fournisseur: formData.metadata.fournisseur || undefined,
        reference: formData.metadata.reference || undefined,
        description: formData.metadata.description || undefined,
        emplacement: formData.metadata.emplacement || undefined,
      },
    }

    onAddProduct(product)

    // Réinitialiser le formulaire
    setFormData({
      nom: "",
      categorie: "",
      quantite: "",
      prixUnitaire: "",
      seuilAlerte: "",
      image: "",
      metadata: {
        fournisseur: "",
        reference: "",
        description: "",
        emplacement: "",
      },
    })
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("metadata.")) {
      const metadataField = field.replace("metadata.", "")
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          <DialogDescription>Remplissez les informations du produit à ajouter à votre inventaire.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du produit *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleInputChange("nom", e.target.value)}
                placeholder="Ex: Ordinateur portable Dell"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select value={formData.categorie} onValueChange={(value) => handleInputChange("categorie", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="Électronique">Électronique</SelectItem>
                  <SelectItem value="Accessoires">Accessoires</SelectItem>
                  <SelectItem value="Bureau">Bureau</SelectItem>
                  <SelectItem value="Stockage">Stockage</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Réseau">Réseau</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité *</Label>
              <Input
                id="quantite"
                type="number"
                min="0"
                value={formData.quantite}
                onChange={(e) => handleInputChange("quantite", e.target.value)}
                placeholder="Ex: 50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prixUnitaire">Prix unitaire (€) *</Label>
              <Input
                id="prixUnitaire"
                type="number"
                min="0"
                step="0.01"
                value={formData.prixUnitaire}
                onChange={(e) => handleInputChange("prixUnitaire", e.target.value)}
                placeholder="Ex: 299.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seuilAlerte">Seuil d'alerte *</Label>
              <Input
                id="seuilAlerte"
                type="number"
                min="0"
                value={formData.seuilAlerte}
                onChange={(e) => handleInputChange("seuilAlerte", e.target.value)}
                placeholder="Ex: 10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image du produit</Label>
            <ImageUpload
              value={formData.image}
              onChange={(value) => handleInputChange("image", value)}
              onRemove={() => handleInputChange("image", "")}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Informations complémentaires</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  value={formData.metadata.fournisseur}
                  onChange={(e) => handleInputChange("metadata.fournisseur", e.target.value)}
                  placeholder="Ex: Dell Technologies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={formData.metadata.reference}
                  onChange={(e) => handleInputChange("metadata.reference", e.target.value)}
                  placeholder="Ex: XPS13-2024"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.metadata.description}
                onChange={(e) => handleInputChange("metadata.description", e.target.value)}
                placeholder="Description courte du produit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emplacement">Emplacement</Label>
              <Input
                id="emplacement"
                value={formData.metadata.emplacement}
                onChange={(e) => handleInputChange("metadata.emplacement", e.target.value)}
                placeholder="Ex: Entrepôt A - Étagère 1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter le produit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
