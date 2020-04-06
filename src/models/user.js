const mongoose = require("mongoose");

const User = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date
  }
});

const UserModel = mongoose.model("User", User);
module.exports = UserModel;
