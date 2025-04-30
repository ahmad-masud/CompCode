const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  photo: { type: String },
  theme: { type: String, default: "system" },
  premiumInfo: { type: Map, of: Boolean, default: {} },
  completedLessons: { type: Map, of: Boolean, default: {} },
  completedProblems: { type: Map, of: Boolean, default: {} },
  completedQuizzes: { type: Map, of: Boolean, default: {} },
});

module.exports = mongoose.model("User", userSchema);
