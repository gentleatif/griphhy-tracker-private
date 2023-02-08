const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const Attachment = db.attachment;
const User = db.User;

const { v4: uuid } = require("uuid");

var path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "./credentials.json"),
  scopes: [
    "https://www.googleapis.com/auth/admin.directory.user",
    "https://www.googleapis.com/auth/admin.directory.customer",
    "https://www.googleapis.com/auth/admin.datatransfer",
  ],
});

const admin = google.admin({
  version: "directory_v1",
  auth: auth,
});

console.log(admin.users.list({ userKey: "adminatif@atifhussain.me" }));

const transfer = google.admin({
  version: "datatransfer_v1",
  auth: auth,
});
exports.createUser = async (req, res) => {
  try {
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
    user.emailVerified = 1;
    user = await user.save();
    if (!user) {
      return res.status(500).send({ message: "User can not be created!" });
    }
    const googlePassword = uuid();

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

    return res.status(200).send(user);
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
    // take all data from req.body and update replace it with old user data

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
      // replace old user_media with new user_media
      await Attachment.destroy({ where: { userId: id } });
      user_media = await Attachment.bulkCreate(user_media);
      // get ids of user_media
      user_media = user_media.map((media) => media.id);
      // set user_media to user
      user.attachment = user_media;
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
    user.email = "adminatif@atifhussain.me";
    console.log("user", user.email);
    // get userId from workspace using email id
    let adminworkspace = await admin.users.get({
      userKey: "adminatif@atifhussain.me",
    });

    let userworkspace = await admin.users.get({
      userKey: user.email,
    });

    console.log(userworkspace);

    // get all applications of user
    // let userApps = await transfer.applications.list({
    //   userKey: user.email,
    //   maxResults: 50,
    // });
    // list down all applications of user atleast 50
    let userApps = await transfer.applications.list({
      userKey: user.email,
      maxResults: 50,
    });

    return res.status(200).send(userApps);

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
