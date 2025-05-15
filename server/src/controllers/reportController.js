const Report = require("../models/Report");

exports.submitReport = async (req, res) => {
  const { problemNumber, companyName } = req.body;
  const { uid, email } = req.user;

  if (!problemNumber || !companyName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const report = new Report({
      uid,
      email,
      problemNumber,
      companyName,
    });

    await report.save();
    res.status(200).json({ message: "Report submitted successfully" });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
};
