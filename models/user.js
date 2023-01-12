module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    fullname: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    designation: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    projects: {
      type: Sequelize.JSON,
    },
    attachment: {
      type: Sequelize.JSON,
    },
    address: {
      type: Sequelize.STRING,
    },
    employeeId: {
      type: Sequelize.STRING,
    },
    profilePic: {
      type: Sequelize.STRING,
    },
    todayTotalTrackedTime: {
      type: Sequelize.INTEGER,
    },
    gender: {
      type: Sequelize.STRING,
    },
    emailVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: Sequelize.STRING,
    },
    emailVerificationTokenExpiry: {
      type: Sequelize.DATE,
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
    },
    passwordResetTokenExpiry: {
      type: Sequelize.DATE,
    },
    // 0 : inactive user
    // 1 : active user
    // 2 : project manager
    // 3 : admin
    role: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  });
  return User;
};
