const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const { json } = require("express");
require("dotenv").config();

const jwtSecret = process.env.SECRET_KEY;

module.exports = {

  generateAccessToken(payload, res) {
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
    let maxAge = 30 * 60 * 1000
    if (payload.role === "user") {

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge,
      });
    } else if (payload.role === "user") {

      res.cookie("adJwt", token, {
        httpOnly: true,
        maxAge: maxAge,
      });
    }
    return token
  },

  generateRefreshToken(payload, res) {
    const { _id } = payload
    const refreshPayload = { _id };
    console.log(_id, "payloda");
    const refreshSecret = jwt.sign(refreshPayload, jwtSecret, {
      expiresIn: "30d",
    });
    let maxAge = 30 * 24 * 60 * 60 * 1000

    if (payload.role === "user") {

      res.cookie("ReTkn", refreshSecret, {
        httpOnly: true,
        maxAge: maxAge,
      });
    } else if (payload.role === "admin") {

      res.cookie("adReTkn", refreshSecret, {
        httpOnly: true,
        maxAge: maxAge,
      });
    }

    return refreshSecret;
  },

  reGenerateAccessToken(refreshToken, payload, res) {
    const { _id } = payload
    jwt.verify(refreshToken, jwtSecret, (err, user) => {
      if (err) {
        return console.error("Error verifying refresh token:", err.message);
      }

      // If the refresh token is valid, issue a new access token
      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: "30m" });
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
      });

      const refreshSecret = jwt.sign(
        { _id },
        jwtSecret,
        { expiresIn: "30d" }
      );
      res.cookie("ReTkn", refreshSecret, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      const token = { accessToken, refreshSecret }
      return token;
    });
  },

  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res.status(401).json("You are not authenticated");

      const token = authHeader.split(" ")[1];
      const role = authHeader.split(" ")[2];
      console.log(role);
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, jwtSecret);
      } catch (error) {
        return res.status(401).json({ message: "JWT Expired. Please login" });
      }
      // console.log(decodedToken);

      if (decodedToken) {
        if (role === "user") {
          req.user = await User.findOne({ _id: decodedToken._id }).select("-password")
        } else if (role === "admin") {
          console.log("here it is");
          req.admin = await Admin.findOne({ _id: decodedToken._id }).select("-password")
        }
      }
      next();
    } catch (error) {
      console.error("Error verifying JWT:", error.message);
      return res.status(401).json({ message: `Error verifying JWT: ${error.message}` });
    }
  },
};
