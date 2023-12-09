const catchAsync = require("../utils/catchAsync");
const dbManager = require("../utils/dbManager");
const constant = require("../utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const { sanitizeAndFormatFullName } = require("../utils/userIdCreator");
const jwt = require("jsonwebtoken");
const { autoIncrement } = require("../utils/commonFunctions");

const saltRounds = 10;
const TableName = "IntegratedDB";
const incrementalId = "intDbId"; // id is auto incremented

// ==================== fetchTableDataListAndCard ====================//
const fetchTableDataListAndCard = async (
  tableDataCondition,
  cardsCondition,
  paginationCondition,
  searchCondition
) => {
  let limit = paginationCondition.limit || 10; // The Number Of Records Want To Fetch
  let skipPage = paginationCondition.skipPage || 0; // The Number Of Page Want To Skip
  const aggregateArray = [
    {
      $match: {
        status: {
          $ne: "delete",
        },
        role: {
          $ne: "superAdmin",
        },
      },
    },
    // facet
    {
      $facet: {
        total: [
          {
            $match: {
              $and: [searchCondition, cardsCondition],
            },
          },
          { $count: "total" },
        ],
        cards: [
          { $match: cardsCondition },
          {
            $group: {
              _id: null,
              totalPending: {
                $sum: {
                  $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
                },
              },
              totalActive: {
                $sum: {
                  $cond: [{ $eq: ["$status", "active"] }, 1, 0],
                },
              },
              totalBlock: {
                $sum: {
                  $cond: [{ $eq: ["$status", "block"] }, 1, 0],
                },
              },
              totalRejected: {
                $sum: {
                  $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
                },
              },
              total: {
                $sum: 1,
              },
            },
          },
        ],
        tableData: [
          { $match: tableDataCondition },
          {
            $project: {
              _id: 1,
              userId: 1,
              fullName: 1,
              email: 1,
              phoneNumber: 1,
              address: 1,
              gender: 1,
              role: 1,
              status: 1,
              dbAccess: 1,
              dbName: 1,
            },
          },
          {
            $sort: { _id: -1 },
          },
          // search from project
          {
            $match: searchCondition,
          },
          { $skip: skipPage },
          { $limit: limit },
        ],
      },
    },
    {
      $project: {
        tableData: 1,
        cards: {
          $ifNull: [
            { $arrayElemAt: ["$cards", 0] },
            {}, // Default value if 'cards' array is empty
          ],
        },
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

// ==================== add user record  ====================//
const addDatabase = catchAsync(async (req, res) => {
  const data = req.body;
  data[incrementalId] = await autoIncrement(TableName, incrementalId);
  const Record = await generalService.addRecord(TableName, data);
  res.send({
    status: constant.SUCCESS,
    message: "Record added successfully",
    Record: Record,
  });
});
// ==================== handleUser-DB-Status ====================//

const handleUserDbStatus = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user._id;

  let isExistUser = await generalService.getSingleRecord(TableName, {
    _id: data._id,
  });

  // Check if user does not exist or is a superAdmin being accessed by a non-superAdmin
  if (
    !isExistUser ||
    (isExistUser.role === "superAdmin" && isExistUser._id !== userId)
  ) {
    return res.status(404).send({
      status: constant.ERROR,
      message: "User not found",
    });
  }

  // Check for valid database access change
  if (isExistUser.dbAccess === data.dbAccess) {
    return res.status(409).send({
      status: constant.ERROR,
      message: "Database Access is already " + data.dbAccess,
    });
  } else {
    // Toggle database access
    data.dbAccess = isExistUser.dbAccess === "allowed" ? "denied" : "allowed";

    const updatedRecord = await generalService.findAndModifyRecord(
      TableName,
      { _id: data._id },
      data
    );

    res.send({
      status: constant.SUCCESS,
      message: `Database access updated successfully to ${data.dbAccess}`,
      Record: updatedRecord,
    });
  }
});

// ==================== get Users ====================//
// ==================== Get Record and search conditions ====================//
const getUsers = catchAsync(async (req, res) => {
  let data = {};
  try {
    data = req.query.query ? JSON.parse(req.query.query) : {};
  } catch (error) {
    return res.status(400).send({
      status: constant.ERROR,
      message: "Invalid JSON format in query",
    });
  }

  let limit = (data && data.limit) || 10;
  let skipPage = limit * (data && data.pageNumber - 1) || 0;
  let pagination = { limit: limit, skipPage: skipPage };
  let tableDataCondition = {};
  let searchCondition = {};

  if (data && data.fullName) {
    searchCondition = {
      $expr: {
        $regexMatch: {
          input: {
            $concat: ["$fullName", "$email", { $toString: "$userId" }],
          },
          regex: `.*${data.fullName}.*`,
          options: "i",
        },
      },
    };
  }

  if (data && data.role && data.role !== "all") {
    searchCondition["role"] = data.role;
  }
  if (data && data.status && data.status !== "all") {
    searchCondition["status"] = data.status;
  }

  const Record = await fetchTableDataListAndCard(
    tableDataCondition,
    {},
    pagination,
    searchCondition
  );

  res.send({
    status: constant.SUCCESS,
    message: "Record fetch successfully",
    Record: Record[0],
  });
});
// ==================== update user record ====================//
const updateUsers = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user._id;

  data.updatedAt = Date.now();
  data.updatedBy = userId;
  const Record = await generalService.findAndModifyRecord(
    TableName,
    { _id: data._id },
    data
  );
  const RecordAll = await fetchTableDataListAndCard(
    {
      _id: Record._id,
    },
    {},
    {},
    {}
  );
  res.send({
    status: constant.SUCCESS,
    message: "Record updated successfully",
    Record: {
      tableData: RecordAll[0].tableData[0],
      page: RecordAll[0].page,
      total: RecordAll[0].total,
      cards: RecordAll[0].cards,
    },
  });
});

// ====================   delete user record   ====================//
const deleteUsers = catchAsync(async (req, res) => {
  const { _id } = req.body;
  let cardsCondition = {};
  const Record = await generalService.findAndModifyRecord(
    TableName,
    { _id: _id },
    { status: "delete" }
  );
  const RecordAll = await fetchTableDataListAndCard(
    { _id: Record._id },
    cardsCondition,
    {},
    {}
  );
  res.send({
    status: constant.SUCCESS,
    message: "User deleted successfully",
    Record: {
      tableData: { _id: _id },
      cards: RecordAll[0].cards,
      total: RecordAll[0].total,
    },
  });
});

// ====================  reset password   ====================//
const resetPassword = catchAsync(async (req, res) => {
  let data = req.body;
  const password = await bcrypt.hash(data.password, saltRounds);
  const userObj = await generalService.updateRecord(
    "User",
    {
      _id: data._id,
    },
    {
      password: password,
    }
  );

  if (userObj) {
    let record = await fetchUserList({ _id: userObj._id });
    res.status(200).send({
      status: constant.SUCCESS,
      message: "Password Set Successfully",
      Record: record,
    });
  } else {
    throw new AppError("Some error occur while setting password ", 400);
  }
});

// ==================== get  details by his id    ====================//
const getUserDetailById = catchAsync(async (req, res) => {
  const { _id } = JSON.parse(req.params.query);
  if (_id) {
    const UserRecord = await getDetailsById(_id);
    res.send({
      status: constant.SUCCESS,
      message: "User details fetch successfully",
      Record: UserRecord[0],
    });
  } else {
    res.send({
      status: constant.ERROR,
      message: "Something went wrong while fetching User details",
    });
  }
});
module.exports = {
    addDatabase,
};
