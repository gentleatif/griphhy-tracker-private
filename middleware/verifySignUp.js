const db = require("../models");
const User = db.User;
const path = require("path");
exports.verifySignUp = async (req, res, next) => {
  const {
    fullname,
    password,
    address,
    designation,
    attachment,
    projects,
    description,
    email,
    employeeId,
    gender,
  } = req.body;

  try {
    // Email must be unique

    if (!email) {
      return res.status(400).send({
        message: "Failed! Email is required!",
      });
    }
    let user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.status(400).send({
        message: "Failed! user is already in use!",
      });
    }
    // Fullname (3 characters )
    if (!fullname) {
      return res.status(400).send({
        message: "Failed! Fullname is required!",
      });
    }
    // full name must be 3 characters long
    if (fullname.length < 3) {
      return res.status(400).send({
        message: "Failed! Fullname must be 3 characters long!",
      });
    }

    if (!password) {
      return res.status(400).send({
        message: "Failed! Password is required!",
      });
    }
    // Password (8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    let passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        message:
          "Failed! Password must be 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character!",
      });
    }
    // attahcment is not compulsory
    // if (!req.file) {
    //   return res.status(400).send({
    //     message: "Failed! attachement is required!",
    //   });
    // }

    if (!gender) {
      return res.status(400).send({
        message: "Failed! Gender is required!",
      });
    }
    // gender must be M || F || O
    console.log("gender=====>", gender);
    if (gender !== "M" && gender !== "F" && gender !== "O") {
      return res.status(400).send({
        message: "Failed! Gender is not valid!",
      });
    }

    if (!address) {
      return res.status(400).send({
        message: "Failed! Address is required!",
      });
    }

    if (!designation) {
      return res.status(400).send({
        message: "Failed! Designation is required!",
      });
    }

    if (!employeeId) {
      return res.status(400).send({
        message: "Failed! EmployeeId is required!",
      });
    }

    next();
  } catch (error) {
    console.log("error: ===>", error);
    return res.status(500).send({
      message: "User can not be created",
    });
  }
};
