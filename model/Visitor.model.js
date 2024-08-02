const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());

const VisitorSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  purposeOfVisit: {
    type: String,
    required: true,
  },
  whomToMeet: {
    type: String,
    required: true,
  },
  inTime: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
  },
  outTime: {
    type: String,
  },
});

const Visitor = mongoose.model("Visitor", VisitorSchema);

module.exports = Visitor;
