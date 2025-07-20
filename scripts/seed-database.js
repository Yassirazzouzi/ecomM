const { MongoClient } = require("mongodb")

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB_NAME || "depot-inventory"
const COLLECTION_NAME = "products"

// Données d'exemple
const sampleProducts = [
  {
    nom: "Ordinateur Portable Dell XPS 13",
    categorie: "Électronique",
    quantite: 25,
    prixUnitaire: 1200,
    seuilAlerte: 10,
    image: "/placeholder.svg?height=300&width=300&text=Dell+XPS+13",
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Dell Technologies",
      reference: "XPS13-2024",
      description: "Ordinateur portable ultra-fin 13 pouces",
      emplacement: "Entrepôt A - Étagère 1",
    },
  },
  {
    nom: "Souris Sans Fil Logitech MX Master 3",
    categorie: "Accessoires",
    quantite: 150,
    prixUnitaire: 89,
    seuilAlerte: 50,
    image: "/placeholder.svg?height=300&width=300&text=Logitech+MX+Master+3",
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Logitech",
      reference: "MX-MASTER-3",
      description: "Souris ergonomique sans fil haute précision",
      emplacement: "Entrepôt B - Étagère 3",
    },
  },
  {
    nom: "Clavier Mécanique Corsair K95",
    categorie: "Accessoires",
    quantite: 75,
    prixUnitaire: 180,
    seuilAlerte: 20,
    image: "/placeholder.svg?height=300&width=300&text=Corsair+K95",
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Corsair",
      reference: "K95-RGB-PLATINUM",
      description: "Clavier mécanique gaming RGB",
      emplacement: "Entrepôt B - Étagère 2",
    },
  },
  {
    nom: "Écran 4K Samsung 27 pouces",
    categorie: "Électronique",
    quantite: 8,
    prixUnitaire: 450,
    seuilAlerte: 15,
    image: "/placeholder.svg?height=300&width=300&text=Samsung+4K+27",
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Samsung",
      reference: "U28E590D",
      description: "Moniteur 4K UHD 27 pouces",
      emplacement: "Entrepôt A - Étagère 2",
    },
  },
  {
    nom: "Casque Audio Sony WH-1000XM4",
    categorie: "Audio",
    quantite: 45,
    prixUnitaire: 350,
    seuilAlerte: 25,
    image: "/placeholder.svg?height=300&width=300&text=Sony+WH-1000XM4",
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Sony",
      reference: "WH1000XM4-B",
      description: "Casque sans fil à réduction de bruit",
      emplacement: "Entrepôt C - Étagère 1",
    },
  },
  {
    nom: "Webcam Logitech C920 HD",
    categorie: "Accessoires",
    quantite: 30,
    prixUnitaire: 89,
    seuilAlerte: 20,
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Logitech",
      reference: "C920-HD-PRO",
      description: "Webcam HD 1080p avec micro intégré",
      emplacement: "Entrepôt B - Étagère 4",
    },
  },
  {
    nom: "Imprimante Laser HP LaserJet Pro",
    categorie: "Bureau",
    quantite: 12,
    prixUnitaire: 280,
    seuilAlerte: 5,
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "HP Inc.",
      reference: "M404DN",
      description: "Imprimante laser monochrome réseau",
      emplacement: "Entrepôt A - Étagère 3",
    },
  },
  {
    nom: "Disque Dur Externe Seagate 2TB",
    categorie: "Stockage",
    quantite: 60,
    prixUnitaire: 85,
    seuilAlerte: 30,
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Seagate",
      reference: "STGX2000400",
      description: "Disque dur externe portable USB 3.0",
      emplacement: "Entrepôt C - Étagère 2",
    },
  },
  {
    nom: "Tablette iPad Air 64GB",
    categorie: "Électronique",
    quantite: 20,
    prixUnitaire: 650,
    seuilAlerte: 10,
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "Apple",
      reference: "IPAD-AIR-64GB-WIFI",
      description: "Tablette iPad Air 10.9 pouces WiFi",
      emplacement: "Entrepôt A - Étagère 4",
    },
  },
  {
    nom: "Routeur WiFi 6 ASUS AX6000",
    categorie: "Réseau",
    quantite: 15,
    prixUnitaire: 320,
    seuilAlerte: 8,
    dateCreation: new Date(),
    dateModification: new Date(),
    metadata: {
      fournisseur: "ASUS",
      reference: "RT-AX88U",
      description: "Routeur WiFi 6 dual-band gaming",
      emplacement: "Entrepôt C - Étagère 3",
    },
  },
]

async function seedDatabase() {
  let client

  try {
    console.log("🔄 Connexion à MongoDB...")
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    console.log("✅ Connecté à MongoDB")

    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Vérifier si la collection existe déjà et contient des données
    const existingCount = await collection.countDocuments()

    if (existingCount > 0) {
      console.log(`⚠️  La collection contient déjà ${existingCount} produits`)
      console.log("Voulez-vous continuer ? (les doublons seront évités)")
    }

    console.log("🔄 Insertion des produits d'exemple...")

    // Insérer les produits en évitant les doublons (basé sur le nom)
    let insertedCount = 0
    let skippedCount = 0

    for (const product of sampleProducts) {
      const existing = await collection.findOne({ nom: product.nom })

      if (!existing) {
        await collection.insertOne(product)
        insertedCount++
        console.log(`✅ Produit ajouté: ${product.nom}`)
      } else {
        skippedCount++
        console.log(`⏭️  Produit existant ignoré: ${product.nom}`)
      }
    }

    // Créer des index pour améliorer les performances
    console.log("🔄 Création des index...")
    await collection.createIndex({ nom: 1 })
    await collection.createIndex({ categorie: 1 })
    await collection.createIndex({ dateCreation: -1 })
    await collection.createIndex({ nom: "text", categorie: "text" })

    console.log("✅ Index créés")

    // Afficher les statistiques finales
    const totalCount = await collection.countDocuments()
    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalProduits: { $sum: 1 },
            valeurTotale: { $sum: { $multiply: ["$quantite", "$prixUnitaire"] } },
            categories: { $addToSet: "$categorie" },
          },
        },
      ])
      .toArray()

    console.log("\n📊 Statistiques de la base de données:")
    console.log(`   • Produits insérés: ${insertedCount}`)
    console.log(`   • Produits ignorés: ${skippedCount}`)
    console.log(`   • Total produits: ${totalCount}`)

    if (stats.length > 0) {
      console.log(`   • Valeur totale du stock: ${stats[0].valeurTotale.toLocaleString("fr-FR")} €`)
      console.log(`   • Nombre de catégories: ${stats[0].categories.length}`)
      console.log(`   • Catégories: ${stats[0].categories.join(", ")}`)
    }

    console.log("\n🎉 Base de données initialisée avec succès!")
    console.log("\n💡 Prochaines étapes:")
    console.log("   1. Configurez votre variable MONGODB_URI dans .env.local")
    console.log("   2. Démarrez votre application Next.js")
    console.log("   3. Accédez au dashboard pour voir vos produits")
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Connexion MongoDB fermée")
    }
  }
}

// Exécuter le script
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase, sampleProducts }
