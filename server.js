"use strict";
require("dotenv").config();
const db = require("./models");
const User = db.User;
const Project = db.Project;
const Screenshot = db.screenshot;
const Attachment = db.attachment;
const Description = db.description;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
// config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// import all routes of frontend
const authRoutes = require("./routes/api/frontend/auth");
const userRoutes = require("./routes/api/frontend/user");
const projectRoutes = require("./routes/api/frontend/project");
const descriptionRoutes = require("./routes/api/frontend/description");
const screenshotRoutes = require("./routes/api/frontend/screenshot");

// Importing all routes of web panel
const webAuthRoutes = require("./routes/api/web/auth");
const webProjectRoutes = require("./routes/api/web/project");
const webScreenshotRoutes = require("./routes/api/web/screenshot");
const webDescriptionRoutes = require("./routes/api/web/description");
const webUserRoutes = require("./routes/api/web/user");

// middlewares
app.use("/uploads", express.static("./uploads"));
// **** Relations   ****
User.hasMany(Attachment);
Attachment.belongsTo(User);
User.belongsToMany(Project, {
  through: "User_Project",
});
Project.belongsToMany(User, {
  through: "User_Project",
});

// Screenshot Relation
User.hasMany(Screenshot);
Screenshot.belongsTo(User);
Project.hasMany(Screenshot);
Screenshot.belongsTo(Project);

// Description relation
User.hasMany(Description);
Description.belongsTo(User);
Project.hasMany(Description);
Description.belongsTo(Project);

// screenshot relation with description

Description.hasMany(Screenshot);
Screenshot.belongsTo(Description);

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const PORT = process.env.PORT || 3000;
// frontend routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/description", descriptionRoutes);
app.use("/api/screenshot", screenshotRoutes);
// web panel routes
app.use("/api/web/auth", webAuthRoutes);
app.use("/api/web/project", webProjectRoutes);
app.use("/api/web/screenshot", webScreenshotRoutes);
app.use("/api/web/description", webDescriptionRoutes);
app.use("/api/web/user", webUserRoutes);

app.get("/", (req, res) => res.send("hello world"));
app.listen(PORT, () => console.log(`Server is up and running on ...${PORT}`));
