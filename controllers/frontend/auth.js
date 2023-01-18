const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const User = db.User;
const {
  saltRounds,
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY,
  RESET_TOKEN_EXPIRY,
  EMAIL_TOKEN_EXPIRY,
} = require("../../config/authConfig");

// sign in user
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // find user
    if (!email || !password) {
      return res
        .status(404)
        .send({ message: "Please enter email and password." });
    }

    let user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    if (user.emailVerified === false) {
      return res.status(401).send({
        message: "Please verify your email first!",
      });
    }

    // compare password
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Wrong Password!",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      }
    );

    let refreshToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET,

      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }
    );
    // save token in db
    user.refreshToken = refreshToken;
    // set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });
    await user.save();
    res.status(200).send({
      // RESPONSE EVERYTHING EXCEPT PASSWORD
      ...user.dataValues,
      password: undefined,
      emailVerificationToken: undefined,
      emailVerified: undefined,
      accessToken: accessToken,
      refreshToken: undefined,
      passwordResetTokenExpiry: undefined,
      resetPasswordToken: undefined,
      emailVerificationTokenExpiry: undefined,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(401).send({
        message: "Passwords do not match!",
      });
    }
    // old password cannot be same as new password
    if (oldPassword === newPassword) {
      return res.status(401).send({
        message: "Old password cannot be same as new password!",
      });
    }

    const user = await User.findOne({
      where: {
        id: req.userId,
      },
    });

    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).send({
      message: "Password changed successfully!",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// refresh-token
exports.refreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res.status(401).send({ message: "Unauthorized!" });
  }

  const refreshToken = cookies.refreshToken;
  try {
    const foundUser = await User.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });
    if (!foundUser) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    //  evaluate jwt
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (decoded.id !== foundUser.id) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    const accessToken = jwt.sign(
      { id: foundUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      }
    );
    return res.status(200).send({
      accessToken: accessToken,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// logout
exports.logout = async (req, res) => {
  // take token from head and jwt.destroy
  const cookies = req.cookies;
  if (!cookies?.refreshToken)
    return res.status(401).send({ message: "Already Logged Out!" });

  const refreshToken = cookies.refreshToken;

  // is Refresh token in database?
  const foundUser = await User.findOne({
    where: {
      refreshToken: refreshToken,
    },
  });
  if (!foundUser) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }
  // delete the token in db
  foundUser.refreshToken = null;
  await foundUser.save();

  // clear cookie
  res.clearCookie("refreshToken", {
    // except expires and maxAge all other options are required
    // to clear cookies for client to clear cookies
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  return res.status(200).send({
    message: "Logged out successfully!",
  });
};
