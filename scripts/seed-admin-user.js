const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// 🔐 Configuration de la connexion
const MONGODB_URI = "mongodb+srv://yassir22:yassir123@cluster1.uwnqgje.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"; // Remplace par ton URI Atlas
const DB_NAME = "depot-inventory";
const COLLECTION_NAME = "users";

// 👤 Données de l'utilisateur admin
const ADMIN_EMAIL = "yassir@gmail.com";
const ADMIN_PASSWORD = "yassir"; // Choisis un mot de passe sécurisé

async function resetAdminUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔄 Connexion à MongoDB...");
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // 🗑️ Supprimer l'utilisateur s'il existe
    const result = await collection.deleteOne({ email: ADMIN_EMAIL });
    if (result.deletedCount > 0) {
      console.log(`🧹 Utilisateur existant "${ADMIN_EMAIL}" supprimé.`);
    } else {
      console.log(`ℹ️ Aucun utilisateur existant "${ADMIN_EMAIL}" trouvé.`);
    }

    // ✅ Créer la collection si elle n'existe pas
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    if (collections.length === 0) {
      await db.createCollection(COLLECTION_NAME);
      console.log(`✅ Collection "${COLLECTION_NAME}" créée.`);
    } else {
      console.log(`ℹ️ La collection "${COLLECTION_NAME}" existe déjà.`);
    }

    // ✅ Créer un index unique sur l'email
    await collection.createIndex({ email: 1 }, { unique: true });
    console.log("✅ Index unique sur 'email' ajouté.");

    // 🔐 Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 📥 Insérer le nouvel utilisateur
    const newUser = {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: "Admin User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newUser);
    console.log(`✅ Nouvel utilisateur admin "${ADMIN_EMAIL}" créé avec succès.`);
  } catch (error) {
    console.error("❌ Erreur :", error);
  } finally {
    await client.close();
    console.log("🔌 Connexion MongoDB fermée.");
  }
}

// Exécuter le script
resetAdminUser();
