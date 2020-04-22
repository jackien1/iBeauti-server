const mongoose = require("mongoose");

const Profile = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  selection: {
    type: String,
    required: true
  },
  date: {
    type: Date
  }
});

const ProfileModel = mongoose.model("Profile", Profile);
module.exports = ProfileModel;
