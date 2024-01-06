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
                    _id: 0,
                    key: 1,
                    title: 1,
                    // Add other fields you need from the permissions documents
                  },
                },
              ],
              as: "modules", // Output array field.
            },
          },
          { $unwind: "$modules" },
          {
            $project: {
              permissionId: 1,
              name: 1,
              description: 1,
              module: "$modules",
              action: 1,
              // subject: 1,
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
const fetchPermissionListWithoutPagination = async (searchCondition) => {
  console.log("searchCondition===", searchCondition);

  // Ensure that the module field in searchCondition is converted to ObjectId if necessary
  if (searchCondition.module && typeof searchCondition.module === "string") {
    searchCondition.module = searchCondition.module;
  }

  const aggregateArray = [
    { $match: searchCondition },
    {
      $lookup: {
        from: "modules",
        localField: "module",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 0,
              key: 1,
              title: 1,
            },
          },
        ],
        as: "moduleDetails",
      },
    },
    {
      $unwind: {
        path: "$moduleDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        moduleKey: "$moduleDetails.key",
        description: 1,
        createdAt: 1,
      },
    },
  ];

  const result = await generalService.getRecordAggregate(
    TableName,
    aggregateArray
  );
  console.log("Aggregation result:", result);
  return result;
};

// ==================== add document record ====================//
const addPermission = catchAsync(async (req, res) => {
  const data = req.body;
  data.createdBy = req.user._id;
  const { module, name } = data;
  const isExist = await generalService.getRecord(TableName, {
    module: module,
    // name,
  });
  console.log(
    "===isExist",
    isExist.find((value) => value.name === name)
  );
  if (
    isExist &&
    isExist.length > 0 &&
    isExist.find((value) => value.name === name)
  ) {
    throw new AppError("Record already exists", 409);
  } else {
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
      console.error("Error adding permission:", error);
      return res.status(500).send({
        status: "error",
        message: "Error adding permission record--",
      });
    }
  }
});
// =====================================getDocument
const getPermission = catchAsync(async (req, res) => {
  console.log("==data====", req.params.query);
  const data = JSON.parse(req.params.query);
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
const getPermissionDetailsWithId = catchAsync(async (req, res) => {
  const data = JSON.parse(req.params.query);
  // const recordAll = await fetchPermissionListWithoutPagination({
  //   module: data.module, // Ensure data.module is ObjectId
  // });
  const Record = await generalService.getRecord(TableName, {
    module: data.module,
  });
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: Record,
  });
});

module.exports = { addPermission, getPermission, getPermissionDetailsWithId };
