const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

// isAuthenticated middleware with JWT
exports.isAuthenticated = async (req, res, next) => {
  // token should be passed as Bearer Toekn
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
};

// isAdmin middleware
exports.isAdmin = async (req, res, next) => {
  const user = await User.findOne({
    where: { id: req.userId },
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }
  // admin role is 3
  if (user.role !== 3) {
    return res.status(403).send({ message: "Require Admin Role!" });
  }
  next();
};
// is HR middleware
exports.isHR = async (req, res, next) => {
  const user = await User.findOne({
    where: { id: req.userId },
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }
  // PM role is 2
  if (user.role !== 2) {
    return res.status(403).send({ message: "Require PM Role!" });
  }
  next();
};

// admin and HR middleware
exports.isAdminOrHR = async (req, res, next) => {
  const user = await User.findOne({
    where: { id: req.userId },
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  if (user.role !== 3 && user.role !== 2) {
    return res.status(403).send({ message: "Require Admin or HR Role!" });
  }
  next();
};
