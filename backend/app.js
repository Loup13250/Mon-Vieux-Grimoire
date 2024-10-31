const express = require("express");
const app = express();
const path = require("path");
// const bookRoutes = require("./routes/book");
// const userRoutes = require("./routes/user");
app.use(express.json());

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://loup:2UjwoLCqxxMnQIAF@cluster0.97ys2.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

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

// app.use('/api/books', bookRoutes);
// app.use('/api/auth', userRoutes);

module.exports = app;
