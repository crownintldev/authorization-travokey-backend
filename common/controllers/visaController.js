const catchAsync = require("../utils/catchAsync");
const dbManager = require("../utils/dbManager");
const { autoIncrement } = require("../utils/commonFunctions");
const constant = require("../utils/constant"),
  generalService = require("../services/generalOperation"),
  bcrypt = require("bcryptjs"),
  passport = require("passport"),
  _ = require("lodash");
const AppError = require("../utils/appError");
const incrementalId = "visaId";
const TableName = "Visa";

// ==================== Fetch all Visa list ====================//
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
              visaId: 1,
              from: 1,
              to: 1,
              type: 1,
              category: 1,
              pricing: 1,
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

// ==================== add visa record ====================//
const addVisa = catchAsync(async (req, res) => {
  const data = req.body;
  const { from, to, category, type, pricing } = data;

  // Check for duplicate durations in pricing
  let durations = new Set();
  for (let price of pricing) {
    if (durations.has(price.duration)) {
      throw new AppError("Duplicate duration in the pricing data", 409);
    }
    durations.add(price.duration);
  }

  const existingVisas = await generalService.getRecord(TableName, {
    from,
    to,
    category,
    type,
  });
  // Helper function to check if data is match
  function isDataIdentical(matchedVisa, data) {
    if (
      matchedVisa._id &&
      matchedVisa.from === data.from &&
      matchedVisa.to === data.to &&
      matchedVisa.category === data.category &&
      matchedVisa.type === data.type
    ) {
      return true;
    }

    // if (matchedVisa.pricing.length !== data.pricing.length) return false;

    // Convert each pricing item into a string representation and sort the resulting array.
    // This makes comparisons order-agnostic.
    const sortedMatchedVisaPricing = matchedVisa.pricing
      .map((price) => JSON.stringify(price))
      .sort();

    const sortedDataPricing = data.pricing
      .map((price) => JSON.stringify(price))
      .sort();

    return sortedMatchedVisaPricing.every(
      (price, index) => price === sortedDataPricing[index]
    );
  }

  // Check if the incoming visa data matches any existing visa
  const matchedVisa = existingVisas.find(
    (visa) =>
      visa.from === from &&
      visa.to === to &&
      visa.type === type &&
      visa.category === category
  );

  if (matchedVisa) {
    // Check for an exact match including pricing details
    if (isDataIdentical(matchedVisa, data)) {
      throw new AppError("Record with identical details already exists", 409);
    }
  } else {
    // Create a new visa record if there's no match
    data.createdBy = req.user._id;
    data[incrementalId] = await autoIncrement(TableName, incrementalId);
    const Record = await generalService.addRecord(TableName, data);
    const AllRecord = await fetchVisaList({ _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Record added successfully",
      Record: AllRecord[0],
    });
  }
});
// ==================== add/edit both  visa record ====================//
const editVisa = catchAsync(async (req, res) => {
  const data = req.body;
  const { from, to, category, type, pricing } = data;
  // existingVisas return array of objs
  let existingVisa = null;
  if (data._id && data._id !== undefined) {
    existingVisa = await generalService.getSingleRecord(TableName, {
      _id: data._id,
    });
  }

  if (data && existingVisa) {
    if (
      existingVisa.from === from &&
      existingVisa.to === to &&
      existingVisa.type === type &&
      existingVisa.category === category
    ) {
      let existingPricing = existingVisa.pricing;

      // Remove items from existingPricing if they're not in the new array
      for (let i = existingPricing.length - 1; i >= 0; i--) {
        const existingItem = existingPricing[i];
        const newItem = pricing.find(
          (item) => item.duration === existingItem.duration
        );

        if (!newItem) {
          existingPricing.splice(i, 1);
        }
      }

      // // Iterate over the new array to either add or update items in existingPricing
      // for (let newItem of pricing) {
      //   const existingItemIndex = existingPricing.findIndex(
      //     (item) => item.duration === newItem.duration
      //   );

      //   if (existingItemIndex === -1) {
      //     // Simply add the new item if it doesn't exist
      //     existingPricing.push(newItem);
      //   } else {
      //     const existingItem = existingPricing[existingItemIndex];

      //     // If the items are identical
      //     if (JSON.stringify(existingItem) !== JSON.stringify(newItem)) {
      //       // Replace the existing item with the new item
      //       existingPricing[existingItemIndex] = newItem;
      //     }
      //   }
      // }

      for (let newItem of pricing) {
        const existingItemIndex = existingPricing.findIndex(
          (item) => item.duration === newItem.duration
        );

        if (existingItemIndex === -1) {
          // Simply add the new item if it doesn't exist
          existingPricing.push(newItem);
        } else {
          const existingItem = existingPricing[existingItemIndex];

          // If the items are identical
          if (JSON.stringify(existingItem) === JSON.stringify(newItem)) {
            return res.status(400).send("Exact duplicate item found.");
          } else {
            // If the items have the same duration but different details
            if (
              existingItem.price !== newItem.price ||
              JSON.stringify(existingItem.requiredDocuments) !==
                JSON.stringify(newItem.requiredDocuments)
            ) {
              // Replace the existing item with the new item
              existingPricing[existingItemIndex] = newItem;
            }
          }
        }
      }

      data.pricing = existingPricing;

      const updatedRecord = await generalService.findAndModifyRecord(
        TableName,
        { _id: existingVisa._id },
        data
      );
      const AllRecord = await fetchVisaList({ _id: updatedRecord._id }, {});
      return res.send({
        status: constant.SUCCESS,
        message: "Visa updated successfully",
        Record: AllRecord[0],
      });
    } else {
      // if change these four fields then error if already exist
      const existingVisas = await generalService.getRecord(TableName, {
        from,
        to,
        category,
        type,
      });
      if (existingVisas && existingVisas.length > 0) {
        throw new AppError(
          "Record with identical details already exists 2",
          409
        );
      }
      // Update the matched visa record
      const updatedRecord = await generalService.findAndModifyRecord(
        TableName,
        { _id: existingVisa._id },
        data
      );
      // with pagination
      const AllRecord = await fetchVisaList({ _id: updatedRecord._id }, {});

      return res.send({
        status: constant.SUCCESS,
        message: "Visa updated successfully ",
        Record: AllRecord[0],
      });
    }
  } else {
    // add the user
    const existingVisas = await generalService.getRecord(TableName, {
      from,
      to,
      category,
      type,
    });
    if (existingVisas && existingVisas.length > 0) {
      throw new AppError("Record with identical details already exists 3", 409);
    }
    data.createdBy = req.user._id;
    data[incrementalId] = await autoIncrement(TableName, incrementalId);
    const Record = await generalService.addRecord(TableName, data);
    const AllRecord = await fetchVisaList({ _id: Record._id }, {});
    return res.send({
      status: constant.SUCCESS,
      message: "Record Added successfully",
      Record: AllRecord[0],
    });
  }
});
// ============================================delete=================

const deleteVisa = catchAsync(async (req, res) => {
  const { _id } = req.body;
  const isExist = await generalService.getRecord("User", { _id: _id });
  if (isExist && isExist.length > 0) {
    res.send({
      status: constant.ERROR,
      message: "Record can not deleted because its in use",
    });
  } else {
    await generalService.deleteRecord(TableName, {
      _id: _id,
    });
    const Record = await fetchVisaList({}, {});
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
// ============================get Visa =====================
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

module.exports = { addVisa, editVisa, deleteVisa, getVisa };
