require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const User = require("../models/user");
const Profile = require("../models/profile");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET, TIME } = process.env;

router.get("/", (req, res) => {
  res.status(200);
  res.send("Authentication API");
});

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ userName: req.body.userName });
  if (user) {
    return res.status(400).json({
      userName: "User already exists"
    });
  }

  const newUser = new User({
    name: req.body.name,
    userName: req.body.userName,
    password: req.body.password,
    date: Date.now()
  });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newUser.password, salt);

  newUser.password = hash;
  await newUser.save();

  const payload = {
    id: newUser.id,
    name: newUser.name,
    userName: newUser.userName,
    date: newUser.date
  };

  const token = await jwt.sign(payload, SECRET, {
    expiresIn: TIME
  });

  return res.status(201).json({
    success: true,
    token: `Bearer ${token}`
  });
});

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ userName: req.body.userName });

  if (!user) {
    return res.status(400).json({
      userName: "User not found"
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (isMatch) {
    const payload = {
      id: user.id,
      name: user.name,
      userName: user.userName,
      date: user.date
    };

    const token = await jwt.sign(payload, SECRET, { expiresIn: TIME });
    return res.json({ success: true, token: `Bearer ${token}` });
  } else {
    return res.status(400).json({
      password: "Incorrect Password"
    });
  }
});

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const newProfile = new Profile({
      userId: req.user.userName,
      selection: req.body.selection,
      date: Date.now()
    });

    await newProfile.save();

    res.sendStatus(200);
  }
);

router.get(
  "/profiles",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const profiles = await Profile.find({ userId: req.user.userName });
    return res.status(200).json(profiles);
  }
);

router.get(
  "/getUser",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ userName: req.user.userName });
    return res.status(200).json(user);
  }
);

module.exports = router;
