const multer = require("multer");
const sharp = require("sharp");

// Configuration de la mémoire pour le stockage des fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");

// Fonction pour générer un nom de fichier unique
function generateUniqueFileName(originalName) {
  const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
  return `${cleanName}_${Date.now()}.webp`;
}

module.exports = (operation) => {
  return (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file && operation === "create") {
        return res.status(400).json({ error: "Aucune image téléchargée" });
      }

      if (!req.file) {
        return next();
      }

      // Redimensionnement et enregistrement de l'image
      try {
        // Initialiser imagePath comme une variable temporaire
        let tempImagePath;

        // Redimensionnement de l'image et sauvegarde dans le dossier 'images'
        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize({ width: 375, height: 568, fit: "inside" })
          .webp({ quality: 80 })
          .toBuffer();

        const imageName = generateUniqueFileName(req.file.originalname);
        tempImagePath = `images/${imageName}`;

        require("fs").writeFileSync(tempImagePath, resizedImageBuffer);

        // Si tout est validé, on assigne à req.imagePath, sinon on supprime l'image temporaire
        req.imagePath = tempImagePath;
        next();
      } catch (error) {
        return res.status(500).json({ error: "Erreur de traitement d'image" });
      }
    });
  };
};
