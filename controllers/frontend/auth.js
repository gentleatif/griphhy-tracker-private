const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const Attachment = db.attachment;
const User = db.user;
const saltRounds = 10;
const nodemailer = require("nodemailer");
const { uuid } = require("uuidv4");
exports.signup = async (req, res) => {
  let user = new User({
    ...req.body,
  });
  // if user has uploaded any file
  const attachment_name = req.body.attachment_name;
  if (req.files && req.files.length > 0) {
    // loop through req.files and create an array of objects
    let user_media = req.files.map((file, index) => {
      console.log();
      return {
        imgPath: file.path,
        name: attachment_name[index],
      };
    });
    console.log("user media ========>", user_media);
    // insert many user_media
    user_media = await Attachment.bulkCreate(user_media);
    // get ids of user_media
    user_media = user_media.map((media) => media.id);
    // set user_media to user
    user.attachment = user_media;
  }
  // hash password using jwt
  const salt = await bcrypt.genSalt(saltRounds);
  user.password = await bcrypt.hash(user.password, salt);
  // generate unique token for email verification using uuid
  const token = uuid();
  user.emailVerificationToken = token;
  // email verification token expiry time is 1 minutes
  user.emailVerificationTokenExpiry = Date.now() + 1 * 60 * 1000;

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
    subject: "Email Verification",
    html: `<h1>Click the link below to verify your email</h1>
    <a href="http://localhost:3000/api/auth/verify-email?token=${token}">Verify Email</a>`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("mail error ===>", err);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  //  create a new column in user table called details

  // alter table and add a new column called details
  console.log("user ========>", user);
  user = await user.save();
  if (!user) {
    return res.status(500).send({ message: "User can not be created!" });
  }
  console.log("uesr ========>", user);

  return res.status(200).send({
    message: "User was registered successfully!",
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
        accessToken: null,
        message: "Invalid Password!",
      });
    }
    // generate token

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      // expire token in 1min
      expiresIn: "50min",
    });
    res.status(200).send({
      // RESPONSE EVERYTHING EXCEPT PASSWORD
      ...user.dataValues,
      password: undefined,
      emailVerificationToken: undefined,
      emailVerified: undefined,
      bearerToken: token,
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
    // token expires in 1 min
    user.passwordResetTokenExpiry = Date.now() + 1 * 60 * 1000;
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
      <a href="http://localhost:8000/api/admin/auth/forgot-password?token=${token}">Reset Password</a>`,
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
        message: "Old password cannot be same as new password!",
      });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).send({
      message: "Password reset successfully!",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// logout
exports.logout = async (req, res) => {
  // take token from head and jwt.destroy
  const token = req.headers.authorization.split(" ")[1];
  try {
    return res.status(200).send({
      message: "Logged out successfully!",
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
