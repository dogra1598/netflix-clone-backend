const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email!")
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) return Promise.reject("Email already in use!");
        });
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Must be at least 5 chars long"),
  ],
  authController.postSignup
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail().withMessage("Invalid email!")],
  authController.postLogin
);

module.exports = router;
