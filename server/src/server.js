require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require("path");

require("./passport/googleStrategy")(passport);

const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cors());
app.use("/api/payment/webhook", bodyParser.raw({ type: "application/json" }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use("/api/user", userRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CompCode API!");
});

mongoose
  .connect(String(process.env.MONGO_URI))
  .then(() => {
    console.log("MongoDB connected");
    app.listen(4000, () => console.log("Server running on port 4000"));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
