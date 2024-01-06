const mongoose = require("mongoose");
const constant = require("../utils/constant");
const generalService = require("../services/generalOperation");
const _ = require("lodash");
const { defineAbilitiesFor } = require("../utils/casl-integration");
const { fetchData } = require("../utils/commonFunctions");
// ==================== Fetch all Visa list ====================//
// const fetchData = async (searchCondition) => {
//   console.log("===searchCondition", searchCondition);
//   const aggregateArray = [
//     { $match: searchCondition },
//     {
//       $lookup: {
//         from: "roles",
//         localField: "role",
//         foreignField: "_id",
//         as: "roleDetails",
//         pipeline: [
//           {
//             $lookup: {
//               from: "permissions",
//               let: { permissionIds: "$permissions" },
//               pipeline: [
//                 { $match: { $expr: { $in: ["$_id", "$$permissionIds"] } } },
//                 {
//                   $lookup: {
//                     from: "modules",
//                     localField: "module",
//                     foreignField: "_id",
//                     pipeline: [
//                       {
//                         $project: {
//                           _id: 1,
//                           key: 1,
//                           title: 1,
//                           // Add other fields you need from the permissions documents
//                         },
//                       },
//                     ],
//                     as: "moduleDetails",
//                   },
//                 },
//                 {
//                   $project: {
//                     _id: 1,
//                     action: 1,
//                     subject: 1,
//                     moduleDetails: 1, // Include moduleDetails here
//                   },
//                 },
//               ],
//               as: "permissionsDetails",
//             },
//           },
//           {
//             $project: {
//               roleId: 1,
//               title: 1,
//               permissionsDetails: 1,
//               createdBy: 1,
//             },
//           },
//         ],
//       },
//     },
//     { $unwind: "$roleDetails" },
//     {
//       $addFields: {
//         moduleDetails: {
//           $reduce: {
//             input: "$roleDetails.permissionsDetails",
//             initialValue: [],
//             in: { $concatArrays: ["$$value", "$$this.moduleDetails"] },
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         userId: 1,
//         email: 1,
//         fullName: 1,
//         accountType: 1,
//         moduleDetails: 1,
//         roleDetails: {
//           roleId: "$roleDetails.roleId",
//           title: "$roleDetails.title",
//           permissionsDetails: "$roleDetails.permissionsDetails",
//         },
//         status: 1,
//         token: 1,
//         accountSetupStatus: 1,
//         dbAccess: 1,
//         dbConfig: 1,
//       },
//     },
//     { $sort: { _id: -1 } },
//   ];

//   const result = await generalService.getRecordAggregate(
//     "User",
//     aggregateArray
//   );
//   const user = result.length > 0 ? result[0] : null;
//   return user;
// };

const authenticate = (req, res, next) => {
  const data = req.body;
  const token = req.header("authorization");

  const User = mongoose.model("User");

  User.findByToken(token)
    .then(async (user) => {
      if (!user) {
        return Promise.reject();
      }
      if (user && !user.accountType && !user.role) {
        return Promise.reject();
      }
      if (user.role !== "") {
        // inserting user daily loin details
        // saveDailyLogin(user._id);
      }
      // let userObj = _.pick(user, [
      //   "_id",
      //   "userId",
      //   "email",
      //   "fullName",
      //   "accountType",
      //   "role",
      //   "status",
      //   "token",
      //   "accountSetupStatus",
      //   "dbAccess",
      //   "dbConfig",
      // ]);

      // res.status(200).send({
      //   status: constant.SUCCESS,
      //   ability: ability.rules,
      //   user: userData,
      // });
      if (
        (user.accountType === "administrative" ||
          user.accountType === "staff") &&
        user.status === "active" &&
        user.dbConfig === "cloudBase" &&
        user.dbAccess === "allowed" &&
        user.accountSetupStatus === "completed"
      ) {
        const userData = await fetchData({ _id: user._id }, {});
        const ability = defineAbilitiesFor(userData);
        // res.status(200).send({
        //   status: constant.SUCCESS,
        //   ability: ability.rules,
        //   user: userData,
        // });
        req.user = userData;
        req.ability = ability;
        req.token = token;
        next();
      } else {
        res.status(401).send({
          status: constant.ERROR,
          message: "Unauthorized Access",
        });
      }
    })
    .catch((err) => {
      res.status(401).send({
        status: constant.ERROR,
        message: "Unauthorized User",
        err: err,
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
