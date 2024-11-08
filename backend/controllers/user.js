const User = require("../models/userM");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

exports.signup = (req, res, next) => {
  const email = req.body.email;
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'adresse mail incorrect " });
  }
  if (req.body.password?.length < 4) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit etre de minimum 4 caractères " });
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: email,
        password: hash,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({ error: "Utilisateur a bien été créer!" })
        )
        .catch((error) =>
          res.status(400).json({ error: "Cet email est déjà utilisé " })
        );
    })
    .catch((error) =>
      res
        .status(500)
        .json({ error: "Erreur lors de la création de l'utilisateur !" })
    );
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "L'identifiant est incorrect" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ error: "le mot de passe est incorrect" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) =>
          res
            .status(500)
            .json({ error: "Erreur lors de la comparaison des mots de passe" })
        );
    })
    .catch((error) =>
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche de l'utilisateur" })
    );
};
