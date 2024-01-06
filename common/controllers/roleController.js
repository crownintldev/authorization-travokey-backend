const catchAsync = require("../utils/catchAsync");
const dbManager = require("../utils/dbManager");
const constant = require("../utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const { autoIncrement } = require("../utils/commonFunctions");
const AppError = require("../utils/appError");
const TableName = "Role";
const incrementalId = "roleId"; // id is auto incremented

// ==================== Fetch all Visa list ====================//
const fetchRoleList = async (searchCondition, pagination) => {
  let limit = pagination.limit || 10;
  let skipPage = pagination.skipPage || 0;

  const aggregateArray = [
    {
      $facet: {
        total: [{ $count: "total" }],
        tableData: [
          { $match: searchCondition },
          //====================== Get Permissions Details =================//
          // {
          //   $lookup: {
          //     from: "permissions",
          //     localField: "permissions",
          //     foreignField: "_id",
          //     pipeline: [
          //       {
          //         $project: {
          //           _id: 1,
          //           name: 1,
          //           description: 1,
          //           module: 1,
          //           // Add other fields you need from the permissions documents
          //         },
          //       },
          //     ],
          //     as: "permissionsDetails",
          //   },
          // },
          {
            $lookup: {
              from: "permissions",
              let: { permissionIds: "$permissionDetails" }, // Assuming `permissions` is an array of ObjectIds
              pipeline: [
                // {
                //   $match: {
                //     $expr: { $in: ["$_id", "$$permissionIds"] }, // Match permissions in the array
                //   },
                // },
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", { $ifNull: ["$$permissionIds", []] }],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "modules", // The collection to join.
                    localField: "module", // Field from the input documents.
                    foreignField: "_id", // Field from the documents of the "from" collection.
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          key: 1,
                          title: 1,

                          // Add other fields you need from the permissions documents
                        },
                      },
                    ],
                    as: "moduleDetails", // Output array field.
                  },
                },
                {
                  $project: {
                    _id: 1,
                    moduleDetails: 1,
                    action: 1,
                    subject: 1,
                    // Include other fields you need from the permissions documents
                  },
                },
              ],
              as: "permissionsDetails",
            },
          },
          {
            $project: {
              roleId: 1,
              title: 1,
              permissionsDetails: 1,
              createdBy: 1,
            },
          },
          // { $sort: { _id: -1 } },
          { $skip: skipPage },
          { $limit: limit },
        ],
      },
    },
    {
      $project: {
        tableData: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$total.total", 0] }, 0],
        },
        page: {
          $toInt: {
            $divide: [
              { $ifNull: [{ $arrayElemAt: ["$total.total", 0] }, 0] },
              limit,
            ],
          },
        },
      },
    },
  ];

  return await generalService.getRecordAggregate(TableName, aggregateArray);
};

// ==================== add document record ====================//
const addRole = catchAsync(async (req, res) => {
  const data = req.body;
  const { title, permissionDetails } = data;
  const isRoleExist = await generalService.getRecord(TableName, {
    title: title.toLowerCase(),
  });
  // return res.send({
  //   status: constant.SUCCESS,
  //   message: "Role added successfully",
  //   Record: isRoleExist,
  // });
  if (isRoleExist && isRoleExist.length > 0) {
    throw new AppError("Record already exists", 409);
  } else {
    try {
      data.createdBy = req._id;
      data[incrementalId] = await autoIncrement(TableName, incrementalId);
      const Record = await generalService.addRecord(TableName, data);
      // const AllRecord = await fetchRoleList({ _id: Record._id }, {});
      return res.send({
        status: constant.SUCCESS,
        message: "Role added successfully",
        Record: Record,
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      return res.status(500).send({
        status: "error",
        message: "Error adding expense record--",
      });
    }
  }
});
// =====================================getDocument
const getRole = catchAsync(async (req, res) => {
  let condition;
  let limit;
  let skipPage;
  let pagination;
  const data = JSON.parse(req.params.query);

  // if (data.query === "all") {
  //   condition = {};
  // }

  if (data.query === "all") {
    condition = {};
    const RecordAll = await fetchRoleList(condition, {});
    res.send({
      status: constant.SUCCESS,
      message: "Record fetch Successfully",
      Record: RecordAll[0],
    });
  } else {
    limit = data?.limit || 10;
    skipPage = limit * (data?.pageNumber - 1) || 0;
    pagination = { limit: limit, skipPage: skipPage };
    const RecordAll = await fetchRoleList({}, pagination);
    res.send({
      status: constant.SUCCESS,
      message: "Record fetch Successfully",
      Record: RecordAll[0],
    });
  }

  // if (data.name) {
  //   condition = {
  //     $expr: {
  //       $regexMatch: {
  //         input: {
  //           $concat: ["$language", { $toString: "$languageId" }],
  //         },
  //         regex: `.*${data.name}.*`,
  //         options: "i",
  //       },
  //     },
  //   };
  // }
});
const getRoleList = catchAsync(async (req, res) => {
  const data = JSON.parse(req.params.query);
  let condition;
  if (data.query === "all") {
    condition = {};
  }
  // const Record = await generalService.getRecordWithProject(
  //   TableName,
  //   condition,
  //   { _id: 1, title: 1, permissionDetails: "$permissions" }
  // );
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch successfully",
    Record,
  });
});
module.exports = { addRole, getRole, getRoleList };
