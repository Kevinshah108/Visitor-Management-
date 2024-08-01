const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes");
const dotenv = require("dotenv");
require("dotenv").config();
const User = require("./model/User.model");
const Visitor = require("./model/Visitor.model");
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://kevinofficial108:sEFLsZusOxddsxrv@cluster0.ah1yzxw.mongodb.net/VManagement"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use("/", userRoutes);

app.get("/addVisitors", (req, res) => {
  Visitor.find()
    .then((visitor) => res.json(visitor))
    .catch((err) => res.json(err));
});

app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp === otp) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
