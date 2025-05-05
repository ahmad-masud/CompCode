const User = require("../models/User");

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      const newUser = await User.create({
        uid: req.user.uid,
        email: req.user.email,
      });
      return res.status(200).json(newUser);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

exports.updateTheme = async (req, res) => {
  const { theme } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { theme },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ error: "Failed to update theme" });
  }
};

exports.setCompletedLesson = async (req, res) => {
  const { title, value } = req.body;

  try {
    const user = await User.findOne({ uid: req.user.uid });

    user.completedLessons.set(title, value);
    await user.save();

    res.status(200).json(user.completedLessons);
  } catch (error) {
    console.error("Error setting completed lesson:", error);
    res.status(500).json({ error: "Failed to set completed lesson" });
  }
};

exports.setCompletedProblem = async (req, res) => {
  const { id, value } = req.body;

  try {
    const user = await User.findOne({ uid: req.user.uid });

    user.completedProblems.set(String(id), value);
    await user.save();

    res.status(200).json(user.completedProblems);
  } catch (error) {
    console.error("Error setting completed problem:", error);
    res.status(500).json({ error: "Failed to set completed problem" });
  }
};

exports.setCompletedQuiz = async (req, res) => {
  const { title } = req.body;

  try {
    const user = await User.findOne({ uid: req.user.uid });

    user.completedQuizzes.set(title, true);
    await user.save();

    res.status(200).json(user.completedQuizzes);
  } catch (error) {
    console.error("Error setting completed quiz:", error);
    res.status(500).json({ error: "Failed to set completed quiz" });
  }
};

exports.exportUserData = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userObj = user.toObject();

    const data = {
      theme: userObj.theme,
      completedLessons: Object.fromEntries(userObj.completedLessons || []),
      completedQuizzes: Object.fromEntries(userObj.completedQuizzes || []),
      completedProblems: Object.fromEntries(userObj.completedProblems || [])
    };

    res.setHeader("Content-Disposition", "attachment; filename=userData.json");
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Error exporting user data" });
  }
};

exports.logoutOfAllDevices = async (req, res) => {
  try {
    const userId = req.user.uid;

    await User.findOneAndUpdate(
      { uid: userId },
      { $inc: { tokenVersion: 1 } }
    );

    res.status(200).json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error("Logout of all devices failed:", error);
    res.status(500).json({ error: "Failed to logout of all devices" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.deleteOne({ uid: req.user.uid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};
