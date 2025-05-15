const express = require("express");
const passport = require("passport");
const { issueToken, logout } = require("../controllers/authController");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  issueToken
);

router.post("/logout", logout);

module.exports = router;
