const catchAsync = require("../../../common/utils/catchAsync");
const constant = require("../../../common/utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const AppError = require("../../../common/utils/appError");
const { autoIncrement } = require("../services/commonFunctions");
const incrementalId = "expenseId";
const TableName = "Expense";
const expenseSchema = require("../models/expense");
// ==================== Fetch all Visa list ====================//
const fetchExpenseList = async (dbConnection, searchCondition, pagination) => {
  let limit = pagination.limit || 10;
  let skipPage = pagination.skipPage || 0;
  // Ensure the model is registered with the correct connection
  if (!dbConnection.models[TableName]) {
    dbConnection.model(TableName, expenseSchema);
  }
  // Use the model from the specific tenant's connection
  const aggregateArray = [
    {
      $facet: {
        total: [{ $count: "total" }],
        tableData: [
          { $match: searchCondition },
          {
            $project: {
              expenseId: 1,
              name: 1,
              category: 1,
              amount: 1,
              remarks: 1,
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

  return await generalService.getRecordAggregate(
    dbConnection,
    TableName,
    aggregateArray
  );
};
// ==================== addExpense record ====================//

const addExpense = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, expenseSchema);
  }
  const data = req.body;
  const { name, category, amount, remarks } = data;
  data.createdBy = req._id;
  try {
    data[incrementalId] = await autoIncrement(
      conn,
      TableName,
      expenseSchema,
      incrementalId
    );
    const Record = await generalService.addRecord(conn, TableName, data);
    const RecordAll = await fetchExpenseList(conn, { _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Record added successfully",
      data: RecordAll[0],
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).send({
      status: "error",
      message: "Error adding expense record--",
    });
  }
});

// ==================== editExpense record ====================//
const editExpense = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, expenseSchema);
  }
  const data = req.body;
  const { _id } = data;
  try {
    if (_id) {
      let existingDocument = await generalService.getSingleRecord(
        conn,
        TableName,
        {
          _id,
        }
      );

      if (existingDocument) {
        const Record = await generalService.findAndModifyRecord(
          conn,
          TableName,
          { _id: existingDocument._id },
          data
        );

        // Fetch updated record
        const updatedRecord = await fetchExpenseList(
          conn,
          { _id: Record._id },
          {}
        );
        return res.send({
          status: constant.SUCCESS,
          message: "Visa updated successfully",
          Record: updatedRecord[0],
        });
      }
      return res.status(404).send({
        status: constant.FAILURE,
        message: "Document not found",
      });
    }
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).send({
      status: "error",
      message: "Error editing expense record--",
    });
  }
});

// ===============================deleteExpense ===================?
const deleteExpense = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, expenseSchema);
  }
  const { _id } = req.body;

  const isExist = await generalService.getRecord(conn, TableName, { _id });
  if (isExist && isExist.length > 0) {
    res.send({
      status: constant.ERROR,
      message: "Record can not deleted because its in use",
    });
  } else {
    await generalService.deleteRecord(conn, TableName, {
      _id: _id,
    });
    const Record = await fetchExpenseList(conn, {}, {});
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
const getExpense = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, expenseSchema);
  }
  console.log("====", req.params.query);
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
  const RecordAll = await fetchExpenseList(conn, condition, pagination);
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: RecordAll[0],
  });
});
module.exports = { addExpense, editExpense, deleteExpense, getExpense };
