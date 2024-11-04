require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const express = require("express");
const mongoose = require("mongoose");
const bookRoutes = require("./routes/bookM");
const userRoutes = require("./routes/userM");

const path = require("path"); //manipuler les chemins de fichiers
const app = express();
app.use(express.json());

// afficher les images directement sur mon site
app.use("/images", express.static(path.join(__dirname, "images")));

// Check if dotenv bien lancé
if (!process.env.MONGO_URI) {
  console.log("Erreur lors du chargement des variables d'environnement.");
  process.exit(1);
}
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));

// CORS (Cross-Origin Resource Sharing) permet a l'API de recevoir des requêtes provenant de domaines différents,
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // accéder à l'API depuis n'importe quelle origine ( '*' )
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  ); //ajoute les headers mentionnés aux requêtes envoyées vers API (Origin , X-Requested-With , etc.)
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  ); //envoyer des requêtes avec les méthodes GET ,POST , PUT etc..
  next();
});

app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
