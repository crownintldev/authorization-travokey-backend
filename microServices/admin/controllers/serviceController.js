const catchAsync = require("../../../common/utils/catchAsync");
const constant = require("../../../common/utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const AppError = require("../../../common/utils/appError");
const { autoIncrement } = require("../services/commonFunctions");
const incrementalId = "serviceId";
const TableName = "Service";
const { serviceSchema } = require("../models/service");

// ==================== Fetch all Visa list ====================//
const fetchServiceList = async (dbConnection, searchCondition, pagination) => {
  let limit = pagination.limit || 10;
  let skipPage = pagination.skipPage || 0;
  // Ensure the model is registered with the correct connection
  if (!dbConnection.models[TableName]) {
    dbConnection.model(TableName, serviceSchema);
  }
  // Use the model from the specific tenant's connection
  //   const modelName = dbConnection.model(TableName);
  const aggregateArray = [
    {
      $facet: {
        total: [{ $count: "total" }],
        tableData: [
          { $match: searchCondition },
          {
            $project: {
              serviceId: 1,
              name: 1,
              category: 1,
              remarks: 1,
              attachments: 1,
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

// ==================== add document record ====================//
const addService = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, serviceSchema);
  }
  const data = req.body;
  const files = req.files;
  const { name, category, remarks } = data;
  data["attachments"] = files;
  data.createdBy = req._id;
  try {
    data[incrementalId] = await autoIncrement(
      conn,
      TableName,
      serviceSchema,
      incrementalId
    );
    const Record = await generalService.addRecord(conn, TableName, data);
    const AllRecord = await fetchServiceList(conn, { _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Record added successfully",
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
// ==================== edit document record ====================//
const editService = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, serviceSchema);
  }
  const data = req.body;
  const { _id } = data;

  if (_id) {
    let existingDocument = await generalService.getSingleRecord(
      conn,
      TableName,
      {
        _id,
      }
    );

    if (existingDocument) {
      // New attachments from req.files
      const newAttachments = req.files || [];

      // Combine and reformat existing and new attachments
      let updatedAttachments = existingDocument.attachments
        .filter(
          (ea) =>
            !newAttachments.some(
              (na) => na[Object.keys(na)[0]].filename === ea.filename
            )
        )
        .concat(newAttachments);

      // Update the attachments in data for database update
      data.attachments = updatedAttachments;

      const Record = await generalService.findAndModifyRecord(
        conn,
        TableName,
        { _id: existingDocument._id },
        data
      );

      // Fetch updated record
      const updatedRecord = await fetchServiceList(
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
  }

  return res.status(404).send({
    status: constant.FAILURE,
    message: "Document not found",
  });
});

// ================================delete document ===================?
const deleteService = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, serviceSchema);
  }
  const { _id } = req.body;
  const isExist = await generalService.getRecord(conn, "User", { _id });
  if (isExist && isExist.length > 0) {
    res.send({
      status: constant.ERROR,
      message: "Record can not deleted because its in use",
    });
  } else {
    await generalService.deleteRecord(conn, TableName, {
      _id: _id,
    });
    const Record = await fetchServiceList(conn, {}, {});
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
const getService = catchAsync(async (req, res) => {
  const conn = req.db;
  if (!conn.models[TableName]) {
    conn.model(TableName, serviceSchema);
  }
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
  const RecordAll = await fetchServiceList(conn, condition, pagination);
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: RecordAll[0],
  });
});
module.exports = { addService, editService, deleteService, getService };
