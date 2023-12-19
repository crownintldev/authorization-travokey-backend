const catchAsync = require("../utils/catchAsync");
const constant = require("../utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const { autoIncrement } = require("../utils/commonFunctions");
const AppError = require("../utils/appError");

const TableName = "Permission";
const incrementalId = "permissionId"; // id is auto incremented

// ==================== Fetch all Visa list ====================//
const fetchPermissionList = async (searchCondition, pagination) => {
  let limit = pagination.limit || 10;
  let skipPage = pagination.skipPage || 0;

  // Use the model from the specific tenant's connection
  //   const modelName = dbConnection.model(TableName);
  const aggregateArray = [
    {
      $facet: {
        total: [{ $count: "total" }],
        tableData: [
          { $match: searchCondition },
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
              as: "modules", // Output array field.
            },
          },
          {
            $project: {
              permissionId: 1,
              name: 1,
              description: 1,
              modules: 1,
              action: 1,
              subject: 1,
              createdBy: 1,
            },
          },
          {
            $sort: { _id: -1 },
          },
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
const addPermission = catchAsync(async (req, res) => {
  const data = req.body;
  data.createdBy = req._id;
  try {
    data[incrementalId] = await autoIncrement(TableName, incrementalId);

    const Record = await generalService.addRecord(TableName, data);
    const AllRecord = await fetchPermissionList({ _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Permission added successfully",
      Record: AllRecord[0],
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).send({
      status: "error",
      message: "Error adding expense record--",
    });
  }
});
// =====================================getDocument
const getPermission = catchAsync(async (req, res) => {
  console.log(
    "===================================== query ===================================",
    req.query
  );
  const data = JSON.parse(req.query);

  let limit = data?.limit || 10;
  let skipPage = limit * (data?.pageNumber - 1) || 0;
  let pagination = { limit: limit, skipPage: skipPage };
  let condition = {};

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
  const RecordAll = await fetchPermissionList(condition, pagination);
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: RecordAll[0],
  });
});
const getPermissionDetails = catchAsync(async (req, res) => {
  // ... Rest of your code ...

  const RecordAll = await fetchPermissionList({}, {});
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: RecordAll[0],
  });
});

module.exports = { addPermission, getPermission, getPermissionDetails };
