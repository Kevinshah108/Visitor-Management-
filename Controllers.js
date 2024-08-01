const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const secretKey = "secretkey";
const Visitor = require("./model/Visitor.model.js");
const User = require("./model/User.model.js");
const { json } = require("body-parser");
const moment = require("moment-timezone");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { promises } = require("dns");
const { v4: uuidv4 } = require("uuid");

const currentTimeIST = moment().tz("Asia/Kolkata");
const currentDateIST = currentTimeIST.format("DD-MM-YYYY");
const currentTimeISTFormatted = currentTimeIST.format("HH:mm:ss");

// const transporter = nodemailer.createTransport({
//   service: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "kevinofficial108@gmail.com",
//     pass: "qgup rvvl ditq myxi",
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Replace with your SMTP server
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: "kevinofficial108@gmail.com",
    pass: "qgup rvvl ditq myxi",
  },
  tls: {
    rejectUnauthorized: false, // This option allows self-signed certificates
  },
});

exports.register = async (req, res) => {
  try {
    console.log("Register endpoint called with body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, user, email, contact, BirthDay } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).send({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      user,
      email,
      contact,
      password: hashedPassword,
      BirthDay,
    });

    const addUser = await newUser.save();
    console.log("New user registered:", newUser);

    res.status(200).send({
      message: "User registered successfully",
      data: addUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "Error registering user", error });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login endpoint called with body:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Email not found:", email);
      return res.status(404).send({ message: "Email not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Invalid password for email:", email);
      return res.status(401).send({ message: "Invalid Password" });
    }

    const token = jwt.sign({ email: user.email }, secretKey, {
      expiresIn: "1h",
    });

    console.log("User logged in:", user);
    res.status(200).send({ message: "Login Successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ message: "Error logging in", error });
  }
};

exports.Visitor = async (req, res) => {
  try {
    console.log("AddVisitor is called:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      date: dateInput,
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      purposeOfVisit,
      whomToMeet,
      inTime: inTimeInput,
    } = req.body;

    const currentDateIST = moment(dateInput)
      .tz("Asia/Kolkata")
      .format("DD-MM-YYYY");
    const currentTimeISTFormatted = moment(currentTimeIST)
      .tz("Asia/Kolkata")
      .format("HH:mm:ss");

    const visitor = new Visitor({
      date: currentDateIST,
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      purposeOfVisit,
      whomToMeet,
      inTime: currentTimeISTFormatted,
    });

    const newVisitor = await visitor.save();
    console.log("New visitor registered:", newVisitor);

    res.status(200).send({
      message: "Visitor registered successfully",
      data: newVisitor,
    });
  } catch (error) {
    console.error("Error registering visitor:", error);
    res.status(500).send({ message: "Error registering visitor", error });
  }
};

exports.forgotPass = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    console.log(email);
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    function generateToken(length = 6) {
      const numbers = "0123456789";
      let token = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        token += numbers[randomIndex];
      }
      return token;
    }

    const token = generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    // await user.save();

    const mailOptions = {
      to: email,
      from: "kevinofficial108@gmail.com",
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n 
      OTP : ${token}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("OTP has been sent!");
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res
      .status(500)
      .json({ message: "Error sending password reset email", error });
  }
};

exports.resetPass = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
};
