const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  photo: { type: String },
  theme: { type: String, default: "system" },
  premiumInfo: {
    premium: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
    subscriptionEnd: { type: Date },
    canceled: { type: Boolean, default: false }
  },
  completedLessons: { type: Map, of: Boolean, default: {} },
  completedProblems: { type: Map, of: Boolean, default: {} },
  completedQuizzes: { type: Map, of: Boolean, default: {} },
  tokenVersion: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
