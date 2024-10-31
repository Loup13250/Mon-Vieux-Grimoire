const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json()); //Express prend toutes les requêtes qui ont comme Content-Type  application/json  et met à disposition leur  body

mongoose
  .connect(
    "mongodb+srv://loup:2UjwoLCqxxMnQIAF@cluster0.97ys2.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

module.exports = app;
