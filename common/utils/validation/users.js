const joi = require("joi");

/* ************************************************************************************** */
// users parameters validation.
/* ************************************************************************************** */

exports.addValidation = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    fullName: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    phoneNumber: joi.string().required(),
    accountType: joi.string().required(),
    address: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========value", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};

exports.addValidationGroom = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    _id: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========value", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};

exports.handleUserAccountStatus = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    _id: joi.string().required(),
    status: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========userJoin value ===", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};
exports.handleCreateApp = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    referenceId: joi.string().required(),
    selectedApp: joi.string().required(),
    selectedUseCase: joi.string().required(),
    selectedDatabase: joi.string().required(),
    cardDetails: joi.object.keys({
      cvc: joi.number().required(),
      number: joi.number().required(),
      name: joi.string().required(),
      expiry: joi.string().required(),
    }),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};
exports.handleUserDbStatus = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    _id: joi.string().required(),
    dbAccess: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========userJoin value ===", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};

exports.updateValidation = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    _id: joi.string().required(),
    status: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========value", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};

exports.deleteValidation = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    _id: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========value", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};

exports.updateStatusValidation = function (req, res, next) {
  const data = req.body;
  let objectValidateScheme = joi.object().keys({
    _id: joi.string().required(),
    status: joi.string().required(),
  });

  try {
    const { error, value } = objectValidateScheme.validate(data);
    console.log("========value", value);
    if (error) {
      res.status(422).json({
        status: "ERROR",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    res.status(422).json({
      status: "ERROR",
      message: error.details[0].message,
    });
  }
};
