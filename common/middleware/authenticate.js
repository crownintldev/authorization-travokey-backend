const mongoose = require("mongoose");
const constant = require("../utils/constant");
const generalService = require("../services/generalOperation");
const _ = require("lodash");

const authenticate = (req, res, next) => {
  const token = req.header("authorization");
  const User = mongoose.model("User");
  User.findByToken(token)
    .then(async (user) => {
      if (!user) {
        return Promise.reject();
      }
      if (user.role !== "superAdmin") {
        // inserting user daily loin details
        // saveDailyLogin(user._id);
      }

      let userObj = _.pick(user, [
        "_id",
        "userId",
        "email",
        "dbConnectionString",
        "fullName",
        "role",
        "status",
        "token",
        "accountSetupStatus",
        "dbAccess",
        "dbConfig",
      ]);
      req.user = userObj;
      req.token = token;

      next();
    })
    .catch((e) => {
      res.status(401).send({
        status: constant.ERROR,
        message: "Unauthorized User",
      });
    });
};
/*
const saveDailyLogin = async (userId) => {
  let startDate = new Date(new Date(new Date()).setHours(00, 00, 00));
  let endDate = new Date(new Date(new Date()).setHours(23, 59, 59));

  let condition = {
    createdAt: {
      $gt: startDate,
      $lte: endDate,
    },
  };
  await generalService.findAndModifyRecord(
    "DailyActivity",
    condition,
    { $addToSet: { dailyLogin: userId } }
  );
};
*/

module.exports = { authenticate };
