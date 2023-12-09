const catchAsync = require("../../../common/utils/catchAsync");
const constant = require("../../../common/utils/constant"),
  generalService = require("../../../common/services/generalOperation"),
  _ = require("lodash");
require("../models/visa");
const TableName = "Visa";
const fetchVisaList = async (searchCondition, pagination) => {
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
              whereFrom: 1,
              goingTo: 1,
              category: 1,
              type: 1,
              duration: 1,
              documents: 1,
              createdAt: 1,
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

// ==================== add Visa record  ====================//

const addVisa = catchAsync(async (req, res) => {
  const data = req.body;
  console.log("=====data", data);
  const Record = await generalService.addRecord(TableName, data);

  res.send({
    status: constant.SUCCESS,
    message: "Record added successfully",
    Record: Record,
  });
});

//
// ==================== update user record ====================//
const updateVisa = catchAsync(async (req, res) => {
  const data = req.body;

  data.updatedAt = Date.now();
  const Record = await generalService.findAndModifyRecord(
    TableName,
    { _id: data._id },
    data
  );
  /*
  const RecordAll = await fetchTableDataListAndCard(
    {
      _id: Record._id,
    },
    {},
    {},
    {}
  );
  */

  res.send({
    status: constant.SUCCESS,
    message: "Record updated successfully",
    Record: Record,
  });
});
const getVisa = catchAsync(async (req, res) => {
  const data = JSON.parse(req.params.query);
  let limit = (data && data.limit) || 10;
  let skipPage = limit * (data && data.pageNumber - 1) || 0;
  let pagination = { limit: limit, skipPage: skipPage };
  let condition = {};
  /*
  if (data.name) {
    condition = {
      $expr: {
        $regexMatch: {
          input: {
            $concat: ["$countryName", { $toString: "$countryId" }],
          },
          regex: `.*${data.name}.*`,
          options: "i",
        },
      },
    };
  }
  */
  const Record = await fetchVisaList(condition, pagination);
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: Record[0],
  });
});

const getSearchDetails = catchAsync(async (req, res) => {
  res.send({
    status: constant.SUCCESS,
    message: "Record fetch Successfully",
    Record: "",
  });
});
module.exports = {
  addVisa,
  updateVisa,
  getVisa,
  deleteVisa,
  getSearchDetails,
};
