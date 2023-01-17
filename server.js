require("dotenv").config();
const db = require("./models");
const User = db.User;
const Project = db.Project;
const Screenshot = db.screenshot;
const User_Project = db.User_Project;
const Attachment = db.attachment;
const Description = db.description;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

// body parser to handle missing field
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// import all routes of frontend
const authRoutes = require("./routes/api/frontend/auth");
const userRoutes = require("./routes/api/frontend/user");
const projectRoutes = require("./routes/api/frontend/project");
const descriptionRoutes = require("./routes/api/frontend/description");
const screenshotRoutes = require("./routes/api/frontend/screenshot");

// import all routes of admin
const adminAuthRoutes = require("./routes/api/admin/auth");
const adminProjectRoutes = require("./routes/api/admin/project");
const adminUserRoutes = require("./routes/api/admin/user");

// middlewares
app.use("/uploads", express.static("./uploads"));
// relations
User.hasMany(Attachment);
Attachment.belongsTo(User);
User.belongsToMany(Project, {
  through: "User_Project",
});
Project.belongsToMany(User, {
  through: "User_Project",
});

// User_Project.hasMany(Project);

Project.hasMany(User_Project);
User_Project.belongsTo(Project);

// User_Project.hasMany(User);
// User.belongsTo(User_Project);

// description relation
User_Project.hasMany(Description);
Description.belongsTo(User_Project);

// screenshot relation
User_Project.hasMany(Screenshot);
Screenshot.belongsTo(User_Project);

User_Project.hasMany(User);
User.belongsTo(User_Project);
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const PORT = process.env.PORT || 3000;
// my routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/description", descriptionRoutes);
app.use("/api/screenshot", screenshotRoutes);
// admin routes
app.use("/api/web/auth", adminAuthRoutes);
app.use("/api/web/project", adminProjectRoutes);
app.use("/api/web/user", adminUserRoutes);

app.get("/", (req, res) => res.send("hello world"));
app.listen(PORT, () => console.log(`Server is up and running on ...${PORT}`));
