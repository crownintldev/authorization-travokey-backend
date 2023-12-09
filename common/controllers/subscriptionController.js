const catchAsync = require("../utils/catchAsync");
const dbManager = require("../utils/dbManager");
const { autoIncrement } = require("../utils/commonFunctions");
const constant = require("../utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const AppError = require("../utils/appError");
const incrementalId = "subscriptionId";
const TableName = "Subscription";

// ==================== Fetch all Visa list ====================//
const fetchSubscriptionList = async (searchCondition, pagination) => {
  let limit = pagination.limit || 10;
  let skipPage = pagination.skipPage || 0;
  const aggregateArray = [
    {
      $facet: {
        total: [{ $count: "total" }],
        tableData: [
          { $match: searchCondition },
          {
            $project: {
              subscriptionId: 1,
              name: 1,
              price: 1,
              duration: 1,
              features: 1,
              product: 1,
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
const addSubscription = catchAsync(async (req, res) => {
  const data = req.body;
  const { name, price, duration, features, product } = data;
  // existingVisas return array of objs

  const existingVisas = await generalService.getRecord(TableName, {
    name,
    duration,
    product,
  });
  if (existingVisas && existingVisas.length > 0) {
    throw new AppError("Record with identical details already exists 3", 409);
  } else {
    data.createdBy = req.user._id;
    data[incrementalId] = await autoIncrement(TableName, incrementalId);
    const Record = await generalService.addRecord(TableName, data);
    const AllRecord = await fetchSubscriptionList({ _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Record Added successfully",
      Record: AllRecord[0],
    });
  }
});
// ==================== edit document record ====================//
const editSubscription = catchAsync(async (req, res) => {
  let isExist = null;
  const data = req.body;
  const { _id, name, price, duration, features, product } = data;
  if (data._id && data._id !== undefined) {
    isExist = await generalService.getRecord(TableName, {
      name,
      duration,
      product,
    });
    if (isExist && isExist.length > 0) {
      throw new AppError("Record with identical details already exists 3", 409);
    } else {
      const updatedRecord = await generalService.findAndModifyRecord(
        TableName,
        { _id: data._id },
        data
      );
      // with pagination
      const AllRecord = await fetchSubscriptionList(
        { _id: updatedRecord._id },
        {}
      );

      return res.send({
        status: constant.SUCCESS,
        message: "Subscription updated successfully ",
        Record: AllRecord[0],
      });
    }
  } else {
    throw new AppError("_id is required to edit this record", 409);
  }
});
// ================================delete document ===================?
const deleteSubscription = catchAsync(async (req, res) => {
  const { _id } = req.body;
  const isExist = await generalService.getRecord("User", { _id });
  if (isExist && isExist.length > 0) {
    res.send({
      status: constant.ERROR,
      message: "Record can not deleted because its in use",
    });
  } else {
    await generalService.deleteRecord(TableName, {
      _id: _id,
    });
    const Record = await fetchSubscriptionList({}, {});
    res.send({
      status: constant.SUCCESS,
      message: "Record deleted successfully",
      Record: {
        tableData: { _id: _id },
        total: Record[0].total,
      },
    });
  }
});

// =====================================getDocument
const getSubscription = catchAsync(async (req, res) => {
  const data = JSON.parse(req.params.query);
  let limit = data.limit || 10;
  let skipPage = limit * (data.pageNumber - 1) || 0;
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
  const RecordAll = await fetchSubscriptionList(condition, pagination);
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: RecordAll[0],
  });
});
module.exports = {
  addSubscription,
  editSubscription,
  deleteSubscription,
  getSubscription,
};
