const jwt = require("jsonwebtoken");

exports.issueToken = (req, res) => {
  const user = req.user;

  const token = jwt.sign(
    { uid: user.uid, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
};
