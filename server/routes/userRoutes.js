const express = require("express");
const router = express.Router();
const {
  getUserInfo,
  updateTheme,
  setCompletedLesson,
  setCompletedProblem,
  setCompletedQuiz,
  exportUserData,
  deleteUser,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, getUserInfo);
router.patch("/theme", authenticate, updateTheme);
router.patch("/completed-lesson", authenticate, setCompletedLesson);
router.patch("/completed-problem", authenticate, setCompletedProblem);
router.patch("/completed-quiz", authenticate, setCompletedQuiz);
router.get("/export", authenticate, exportUserData);
router.delete("/", authenticate, deleteUser);

module.exports = router;
