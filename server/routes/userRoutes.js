const express = require("express");
const router = express.Router();
const {
  getUserInfo,
  updateTheme,
  setCompletedLesson,
  setCompletedProblem,
  setCompletedQuiz,
  exportUserData,
  logoutOfAllDevices,
  deleteUser,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, getUserInfo);
router.patch("/theme", authenticate, updateTheme);
router.patch("/completed-lesson", authenticate, setCompletedLesson);
router.patch("/completed-problem", authenticate, setCompletedProblem);
router.patch("/completed-quiz", authenticate, setCompletedQuiz);
router.get("/export", authenticate, exportUserData);
router.post("/logout-of-all-devices", authenticate, logoutOfAllDevices)
router.delete("/", authenticate, deleteUser);

module.exports = router;
