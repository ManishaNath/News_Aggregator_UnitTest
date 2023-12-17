const { JWT_Secret_Key } = require("../config/env.config");

const jwt = require("jsonwebtoken"); // Verify token using JWT

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    console.log("Authorization header not found");
    return res.status(401).json({ message: "User not authenticated" });
  }

  const token = authorizationHeader.split(" ")[1]; // Assuming the header is in the format: Bearer <token>

  if (!token) {
    console.log("Token not provided");
    return res.status(401).json({ message: "User not authenticated" });
  }

  jwt.verify(token, JWT_Secret_Key, (err, decode) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(401).json({ message: "User not authenticated" });
    } else {
      req.user = decode.id;
      console.log("User found successfully");
      return next();
    }
  });
};

module.exports = authenticateUser;
