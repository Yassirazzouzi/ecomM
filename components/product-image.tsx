"use client"

import { useState } from "react"
import { Package } from "lucide-react"

interface ProductImageProps {
  src?: string
  alt: string
  productName: string
  className?: string
}

export function ProductImage({ src, alt, productName, className = "" }: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // Si pas d'image ou erreur de chargement, afficher un placeholder
  if (!src || imageError) {
    return (
      <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <Package className="w-6 h-6 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`relative w-12 h-12 rounded-lg overflow-hidden ${className}`}>
      {isLoading && <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? "none" : "block" }}
      />
    </div>
  )
}
