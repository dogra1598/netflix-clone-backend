const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/HttpError");
const User = require("../models/user");

exports.postSignup = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors.array()[0].msg, 422));
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
      });
      user.save();
      return res.status(201).json({ message: "User added successfully." });
    })
    .catch((err) => {
      throw new HttpError("Something went worng!");
    });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  let currUser;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors.array()[0].msg, 422));
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user)
        return next(new HttpError("User with this email doesn't exist!", 422));
      currUser = user;
      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (!result) return next(new HttpError("Wrong Password!", 422));
          let token;
          try {
            token = jwt.sign(
              { userId: currUser._id, email: currUser.email },
              process.env.JWT_KEY,
              { expiresIn: "1h" }
            );
          } catch {
            return next(new HttpError("Login failed.", 401));
          }
          return res.status(200).json({
            userId: currUser._id,
            token: token,
          });
        })
        .catch(() => {
          throw new HttpError("Something went wrong.", 500);
        });
    })
    .catch(() => {
      throw new HttpError("Something went wrong.", 500);
    });
};
