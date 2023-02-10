const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const Attachment = db.attachment;
const User = db.User;
const nodemailer = require("nodemailer");
const {
  saltRounds,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  RESET_TOKEN_EXPIRY,
  EMAIL_TOKEN_EXPIRY,
} = require("../../config/authConfig.js");
const { v4: uuid } = require("uuid");
exports.createUser = async (req, res) => {
  let user = new User({
    ...req.body,
  });
  // if user has uploaded any file
  let attachment_name = req.body.attachment_name;
  // when req.file name is profilePic
  if (
    req.files &&
    req.files.length > 0 &&
    req.files[0].fieldname === "profilePic"
  ) {
    user.profilePic = req.files[0].path;
  }

  if (
    req.files &&
    req.files.length > 0 &&
    req.files[0].fieldname !== "profilePic"
  ) {
    // loop through req.files and create an array of objects
    let user_media = req.files.map((file, index) => {
      return {
        imgPath: file.path,
        name: attachment_name[index],
      };
    });
    // insert many user_media
    user_media = await Attachment.bulkCreate(user_media);
    // get ids of user_media
    user_media = user_media.map((media) => media.id);
    // set user_media to user
    user.attachment = user_media;
  }
  // hash password using jwt
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  // generate unique token for email verification using uuid
  // const token = uuid();
  // user.emailVerificationToken = token;
  // email verification token expiry time is 1 minutes
  // user.emailVerificationTokenExpiry = EMAIL_TOKEN_EXPIRY;

  // send email verification link
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.PASSWORD,
  //   },
  // });
  // const mailOptions = {
  //   from: process.env.EMAIL,
  //   to: user.email,
  //   subject: "Email Verification",
  //   html: `<h1>Click the link below to verify your email</h1>
  //   <a href="${process.env.CLIENT_URL}/api/web/auth/verify-email?token=${token}">Verify Email</a>`,
  // };
  // transporter.sendMail(mailOptions, (err, info) => {
  //   if (err) {
  //     console.log("mail error ===>", err);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //   }
  // });
  //  create a new column in user table called details

  // alter table and add a new column called details
  user.emailVerified = 1;
  user = await user.save();
  if (!user) {
    return res.status(500).send({ message: "User can not be created!" });
  }

  return res.status(200).send({
    message: "User was created successfully!",
  });
};
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
        message: "Invalid Password!",
      });
    }
    // generate token
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // expiresIn 10min
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

// verify email
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User Not found with this token." });
    }

    if (user.emailVerified === true) {
      return res.status(401).send({
        message: "Email already verified!",
      });
    }
    // check if token is expired
    if (user.emailVerificationTokenExpiry < Date.now()) {
      return res.status(401).send({
        message: "Token expired! Please sign up again.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await user.save();
    // send succuss html page to user
    res.status(200).send({
      message: "Email verified successfully!",
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
        message: "New password cannot be same as old password!",
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
        message: "Wrong Password!",
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

// forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).send({ message: "Email is required!" });
    }
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    // generate token using uuid
    const token = uuid();
    user.resetPasswordToken = token;
    user.passwordResetTokenExpiry = RESET_TOKEN_EXPIRY;
    // update user
    await user.save();

    // send email verification link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset Password",
      html: `<h1>Click the link below to reset your password</h1>
      <a href="${process.env.CLIENT_URL}/api/web/auth/forgot-password?token=${token}">Reset Password</a>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("mail error ===>", err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.status(200).send({
      message: "Email sent successfully!",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });
    if (!user) {
      return res
        .status(404)
        .send({ message: "User Not found with this token." });
    }

    // check if token is expired
    if (user.passwordResetTokenExpiry < Date.now()) {
      return res.status(401).send({
        message: "Token expired! Please forgot pwd again.",
      });
    }

    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(401).send({
        message: "Passwords do not match!",
      });
    }
    // decrypt old password using bcrypt and compare with new password
    // to check if they are not  same
    const samePassword = bcrypt.compareSync(newPassword, user.password);
    if (samePassword) {
      return res.status(401).send({
        message: "New password cannot be same as old password!",
      });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(newPassword, salt);
    // remove resetPasswordToken and passwordResetTokenExpiry
    user.resetPasswordToken = null;
    user.passwordResetTokenExpiry = null;
    await user.save();
    res.status(200).send({
      message: "Password reset successfully!",
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
