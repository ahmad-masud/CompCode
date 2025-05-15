const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  email: { type: String, required: true },
  problemNumber: { type: String, required: true },
  companyName: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
