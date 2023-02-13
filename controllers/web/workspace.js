const { google } = require("googleapis");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const Attachment = db.attachment;
const User = db.User;
const { JWT } = require("google-auth-library");

const { v4: uuid } = require("uuid");

var path = require("path");
const SCOPES = [
  "https://www.googleapis.com/auth/admin.directory.user",
  "https://www.googleapis.com/auth/admin.directory.customer",
  "https://www.googleapis.com/auth/admin.datatransfer",
  "https://www.googleapis.com/auth/admin.directory.user.security",
];
const privatekey = require("../../config/credentials.json");
const auth = new JWT({
  email: privatekey.client_email,
  key: privatekey.private_key,
  subject: process.env.WORKSPACE_ADMIN_EMAIL,
  scopes: SCOPES,
});

const admin = google.admin({
  version: "directory_v1",
  auth: auth,
});

const transfer = google.admin({
  version: "datatransfer_v1",
  auth: auth,
});
exports.createUser = async (req, res) => {
  try {
    let user = new User({
      ...req.body,
    });
    // check if user already exists
    let userExists = await User.findOne({
      where: { email: req.body.email },
    });
    if (userExists) {
      return res.status(400).send({ message: "User already exists!" });
    }

    let googlePassword = uuid();
    let workspace = await admin.users.insert({
      requestBody: {
        name: {
          givenName: req.body.fullname.split(" ")[0],
          familyName: req.body.fullname.split(" ")[1],
        },
        suspended: false,
        primaryEmail: req.body.email,
        password: googlePassword,
        changePasswordAtNextLogin: false,
      },
    });
    // if user has uploaded any file
    let attachment_name = req.body.attachment_name;
    // check if profile Pic is uploaded
    let isProfilePic = req.files.some((singlefile) => {
      return singlefile.fieldname === "profilePic";
    });

    if (req.files && req.files.length > 0 && isProfilePic) {
      user.profilePic = req.files.filter((file) => {
        return file.fieldname === "profilePic";
      })[0].path;
      // remove profile pic from req.files
      req.files = req.files.filter((file) => {
        return file.fieldname !== "profilePic";
      });
    }

    // hash password using jwt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.emailVerified = 1;

    user = await user.save();
    // adding attachment to the newly created user
    if (req.files && req.files.length > 0 && req.files) {
      user_media = req.files.map((file, index) => {
        return {
          name: attachment_name[index],
          imgPath: file.path,
          UserId: user.id,
        };
      });

      let media = await Attachment.bulkCreate(user_media);
    }

    if (!user) {
      return res.status(500).send({ message: "User can not be created!" });
    }
    user = user.toJSON();

    delete user.password;
    user.googlePassword = googlePassword;
    // TODO: Ask to sir , can send all dtls here , otherwise need to call getuser
    return res.status(200).send({
      message: "User created successfully!",
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.updateUser = async (req, res) => {
  let id = req.query._id;

  try {
    let user = await User.findOne({ where: { id: id } });
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    // if user has uploaded any file
    let attachment_name = req.body.attachment_name;
    // check if profile Pic is uploaded
    let isProfilePic = req.files.some((singlefile) => {
      return singlefile.fieldname === "profilePic";
    });

    if (req.files && req.files.length > 0 && isProfilePic) {
      user.profilePic = req.files.filter((file) => {
        return file.fieldname === "profilePic";
      })[0].path;
      // remove profile pic from req.files
      req.files = req.files.filter((file) => {
        return file.fieldname !== "profilePic";
      });
    }

    // hash password using jwt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.emailVerified = 1;

    // return res.status(200).send(user);
    let googlePassword = uuid();
    let workspace = await admin.users.update({
      userKey: user.email,
      requestBody: {
        name: {
          givenName: req.body.fullname.split(" ")[0],
          familyName: req.body.fullname.split(" ")[1],
        },
        suspended: false,
        primaryEmail: req.body.email,
        password: googlePassword,
        changePasswordAtNextLogin: false,
      },
    });

    user.email = req.body.email;
    user = await user.save();
    // adding attachment to the newly created user
    if (req.files && req.files.length > 0 && req.files) {
      user_media = req.files.map((file, index) => {
        return {
          name: attachment_name[index],
          imgPath: file.path,
          UserId: user.id,
        };
      });

      let media = await Attachment.bulkCreate(user_media);
    }
    // convert user to json
    user = user.toJSON();
    user.password = undefined;
    user.googlePassword = googlePassword;
    return res.status(200).send(user);
  } catch (error) {
    console.log("error in update user from catch block", error);
    return res.status(400).send({
      message: error.message || "Some error occurred while updating the User.",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    let user = await User.findAll({
      where: req.query,
      attributes: {
        exclude: [
          "password",
          "emailVerificationToken",
          "emailVerificationTokenExpiry",
          "passwordResetTokenExpiry",
          "resetPasswordTokenExpiry",
          "refreshToken",
          "role",
          "resetPasswordToken",
        ],
      },
      include: [
        {
          model: Attachment,
          attributes: { exclude: ["UserId"] },
        },
      ],
    });
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({
      message: error.message || "Some error occurred while retrieving user.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  console.log("delete user", req.query);
  if (!req.query._id) {
    return res.status(400).send({ message: "User id can not be empty" });
  }
  try {
    // find user by id and update status to 0
    let user = await User.findOne({ where: { id: req.query._id } });
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    if (user.status === 0) {
      return res.status(200).send({ message: "User already deleted" });
    }
    // get userId from workspace using email id
    let adminworkspace = await admin.users.get({
      userKey: process.env.WORKSPACE_ADMIN_EMAIL,
    });

    let userworkspace = await admin.users.get({
      userKey: user.email,
    });

    let userApps = await transfer.applications.list({
      userKey: user.email,
      maxResults: 50,
    });

    userApps = Array.from(userApps.data.applications);
    userApps = userApps.map((app) => {
      let data = {
        applicationId: app.id,
      };
      if (app.transferParams) {
        data.applicationTransferParams = app.transferParams.map((param) => {
          return {
            key: param.key,
            value: param.value,
          };
        });
      }

      return data;
    });
    console.log(userApps);
    let dataTransferred = await transfer.transfers.insert({
      resource: {
        oldOwnerUserId: userworkspace.data.id,
        newOwnerUserId: adminworkspace.data.id,
        applicationDataTransfers: userApps,
      },
    });

    // delete user from workspace using email id
    await admin.users.delete({
      userKey: user.email,
    });

    user.status = 0;
    user = await user.save();

    return res.status(200).send({
      message:
        "User deleted successfully , and their data transferred to the admin",
    });
  } catch (error) {
    return res.status(400).send({
      message: error.message || "Some error occurred while deleting the User.",
    });
  }
};
