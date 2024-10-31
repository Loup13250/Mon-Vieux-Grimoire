const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator"); // pour ne pas que plusieurs Users aient le meme

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // unique pour ne pas que plusieurs Users aient le meme
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); //Validateur de schéma

module.exports = mongoose.model("User", userSchema);
