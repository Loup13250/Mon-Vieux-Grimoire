const Book = require("../models/books");
const fs = require("fs");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// Récupere tous les livres
exports.getBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books); // succes
    })
    .catch((error) => {
      res.status(400).json({
        erreur: error,
      });
    });
};

// Crée un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id; // Supprime le champ _id du livre (sera généré par MongoDB)
  delete bookObject.userId; // Supprime le champ userId (sera ajouté depuis le token)

  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get("host")}/${req.imagePath}`, // Créer une URL pour l'image
    userId: req.auth.userId, // ajout userID depuis l'auth
  });

  book
    .save()
    .then(() =>
      res.status(201).json({ message: "Livre enregistré avec succès =) " })
    )
    .catch((error) => res.status(400).json({ erreur: error }));
};

//Récupere un livre avec une ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        erreur: error,
      });
    });
};

//Modifier un livre existant
exports.modifyBook = (req, res, next) => {
  let bookObject = {};

  // Si une image est fournie via multer
  if (req.file) {
    bookObject = {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get("host")}/${req.imagePath}`, // Crée l'URL de la nouvelle image
    };
  } else {
    // Si aucune image prendre les informations du corps de la requête.
    bookObject = { ...req.body };
  }

  delete bookObject._userId; // Supprime le champ _userID pour eviter des modifications non autorisées.

  //Recherche d'un livre
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non disponible" });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Requete non autorisée" });
      }

      // Mise à jour du livre.
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Livre mis à jour" }))
        .catch((error) => res.status(400).json({ erreur: error }));
    })
    .catch((error) => res.status(500).json({ erreur: error }));
};

// Suprime un livre existant
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: "Requete non autorisée" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() =>
              res.status(200).json({ message: "Livre bien supprimé" })
            )
            .catch((error) => res.status(400).json({ erreur: error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ erreur: error }));
};

// Ajout d'une note a un livre ( entre 0 et 5 )
exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId; // Récupere L'ID depuis l'auth
  const grade = req.body.rating; // Récupere la note depuis le corps de la requete

  if (!grade || grade < 0 || grade > 5) {
    return res.status(400).json({ message: "La note n'est pas valide" });
  }
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const userRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (userRating) {
        return res
          .status(400)
          .json({ message: "Oups! Vous avez déjà noté ce livre" });
      }
      //Push la note de l'utilisateur
      book.ratings.push({ userId, grade });
      const averageRating = (
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / // parcours le tableau book.ratings et fait la moyenne des notes arrondit
        book.ratings.length
      ).toFixed(1);
      book.averageRating = parseFloat(averageRating); // Met a jour la note moyenne
      // parseFloat est utilisé pour s'assurer que la moyenne est stockée sous forme de nombre à virgule flottante.
      return book.save();
    })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(500).json({ erreur: error }));
};

// Récupere les livres avec les meilleurs notes ( tri)
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie les livres par note décroissante
    .limit(3) // limite a 3 livre
    .then((books) => {
      res.status(200).json(books); // envoi les livres + status ok
    })
    .catch((error) => {
      res.status(400).json({
        erreur: error,
      });
    });
};
