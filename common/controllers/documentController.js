const catchAsync = require("../utils/catchAsync");
const dbManager = require("../utils/dbManager");
const { autoIncrement } = require("../utils/commonFunctions");
const constant = require("../utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const AppError = require("../utils/appError");
const incrementalId = "documentId";
const TableName = "Document";

// ==================== Fetch all Visa list ====================//
const fetchDocumentList = async (searchCondition, pagination) => {
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
              documentId: 1,
              inputName: 1,
              inputType: 1,
              inputSize: 1,
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
const addDocument = catchAsync(async (req, res) => {
  const data = req.body;
  const { inputName, inputType, inputSize } = data;
  const existingVisas = await generalService.getRecord(TableName, {
    inputName,
  });

  if (existingVisas && existingVisas.length > 0) {
    // Check for an exact match including pricing details
    throw new AppError("Record with identical details already exists", 409);
  } else {
    // Create a new visa record if there's no match
    data.createdBy = req.user._id;
    data[incrementalId] = await autoIncrement(TableName, incrementalId);
    const Record = await generalService.addRecord(TableName, data);
    const AllRecord = await fetchDocumentList({ _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Record added successfully",
      Record: AllRecord[0],
    });
  }
});
// ==================== edit document record ====================//
const editDocument = catchAsync(async (req, res) => {
  const data = req.body;
  const { _id, inputName, inputType, inputSize } = data;
  let existingDocument = null;
  if (_id) {
    existingDocument = await generalService.getRecord(TableName, {
      _id: _id,
      inputName,
      inputType,
      inputSize,
    });
  }
  if (existingDocument && existingDocument.length > 0) {
    throw new AppError("Record with identical details already exists", 409);
  } else {
    const updatedRecord = await generalService.findAndModifyRecord(
      TableName,
      { _id: existingDocument._id },
      data
    );
    // with pagination
    const AllRecord = await fetchDocumentList({ _id: updatedRecord._id }, {});

    return res.send({
      status: constant.SUCCESS,
      message: "Visa updated successfully ",
      Record: AllRecord[0],
    });
  }
});
// ================================delete document ===================?
const deleteDocument = catchAsync(async (req, res) => {
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
    const Record = await fetchDocumentList({}, {});
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
const getDocument = catchAsync(async (req, res) => {
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
  const RecordAll = await fetchDocumentList(condition, pagination);
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: RecordAll[0],
  });
});
module.exports = { editDocument, addDocument, deleteDocument, getDocument };
