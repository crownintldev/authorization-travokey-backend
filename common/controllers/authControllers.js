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
const TableName = "User";
const incrementalId = "userId"; // id is auto incremented

let userFieldSendFrontEnd = [
  "_id",
  "email",
  "fullName",
  "phoneNumber",
  "role",
  "status",
  "createdAt",
  "profileImageUrl",
  "accountSetupStatus",
];
const emailCheck = catchAsync(async (req, res) => {
  const { email } = JSON.parse(req.params.query);
  console.log("=====email", email);
  const Record = await generalService.getRecord(TableName, { email: email });
  if (Record && Record.length > 0) {
    res.send({
      status: constant.ERROR,
      message: "Email already exists",
    });
  } else {
    res.send({
      status: constant.SUCCESS,
    });
  }
});
//Register User ==============================================================
const signUp = catchAsync(async (req, res) => {
  const data = req.body;

  let user = null;
  //data.status = "active";
  if (data._id) {
    const password = await bcrypt.hash(data.password, saltRounds);
    data.password = password;
    user = await generalService.findAndModifyRecord(
      TableName,
      { _id: data._id },
      data
    );
  } else {
    // data.userId = sanitizeAndFormatFullName(data.fullName && data.fullName);
    // const usId = data.userId;
    // //call db separate  Create function
    // const dbconnectionString = await dbManager.createDatabaseForAdmin(usId);
    // if (dbconnectionString) {
    //   data.dbConnectionString = dbconnectionString;
    // }
    data[incrementalId] = await autoIncrement(TableName, incrementalId);
    user = await generalService.addRecord(TableName, data);
  }
  let token = await user.generateAuthToken();
  user.token = token;
  res.header({ "x-auth": token }).send({
    status: constant.SUCCESS,
    message: constant.USER_REGISTER_SUCCESS,
    user: _.pick(user, [
      "_id",
      "email",
      "token",
      "fullName",
      "role",
      "status",
      "phoneNumber",
      "accountSetupStatus",
      "dbAccess",
    ]),
  });
});
//=====LoginUser =========================================================
const signIn = catchAsync(async (req, res, next) => {
  const data = req.body;

  // login security checks validation

  passport.authenticate("local", {}, (err, user, info) => {
    if (err || !user) {
      res.status(401).send({
        status: constant.ERROR,
        message: constant.EMAIL_PASSWORD_ERROR,
      });
      return;
    }
    req.logIn(user, async (err) => {
      if (err) {
        res.status(400).send({
          status: constant.ERROR,
          message: err.message,
        });
        return;
      }
      if (
        user.role === "superAdmin" &&
        req.headers.origin !== process.env.SUPER_ADMIN_URL
      ) {
        res.status(400).send({
          status: constant.ERROR,
          message: "Invalid role and invalid request origin superadmin",
        });
        return;
      } else if (
        user.role === "admin" &&
        req.headers.origin !== process.env.ADMIN_PORTAL_URL
      ) {
        res.status(400).send({
          status: constant.ERROR,
          message: "galat hy bhai",
        });
        return;
      }

      if (user.status === "active" && user.role) {
        let token = await user.generateAuthToken();
        let data = _.pick(user, userFieldSendFrontEnd);
        data.token = token;
        res.append("x-auth", token);
        res.append("Access-Control-Expose-Headers", "x-auth");

        res.status(200).send({
          status: constant.SUCCESS,
          message: constant.USER_LOGIN_SUCCESS,
          user: data,
        });
      } else {
        res.status(403).send({
          status: constant.ERROR,
          message: "your account is not active. kindly contact with admin",
        });
        return;
      }
    });
  })(req, res, next);
});
const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const authToken = guid.create().value;
  let url = "";
  const Record = await generalService.getRecord(TableName, {
    email: email,
  });
  if (Record.length > 0) {
    if (Record[0].status === "active") {
      await generalService.findAndModifyRecord(
        TableName,
        {
          _id: Record[0]._id,
        },
        {
          forgetPasswordAuthToken: authToken,
        }
      );

      if (Record[0].role === "superAdmin") {
        url = process.env.SUPER_ADMIN_URL + "/setNewPassword/" + authToken;
      }
      console.log("==========forget password url========", url);
      const subjectForgotPassword = `Reset Password Email for ${process.env.PROJECT_NAME}`;
      const sent = await sendEmail(
        email,
        subjectForgotPassword,
        emailTemplate.forgetPasswordEmail(url)
      );

      if (sent) {
        res.status(200).send({
          status: constant.SUCCESS,
          message: constant.FORGOT_EMAIL_SENT_SUCCESS,
        });
      } else {
        res.status(500).send({
          status: constant.ERROR,
          message: constant.FORGOT_PASSWORD_EMAIL_ERROR,
        });
      }
    } else {
      res.status(500).send({
        status: constant.ERROR,
        message: constant.STATUS_BLOCK,
        showAlert: true,
      });
    }
  } else {
    res.status(200).send({
      status: constant.ERROR,
      message: constant.NO_SUCH_EMAIL,
    });
  }
});

const setNewPassword = catchAsync(async (req, res) => {
  const forgetPassAuthToken = req.body.forgetPasswordAuthToken;
  const password = req.body.password;
  const encryptPassword = await bcrypt.hash(password, saltRounds);
  const Record = await generalService.getRecord(TableName, {
    forgetPasswordAuthToken: forgetPassAuthToken,
  });
  if (Record && Record.length > 0) {
    const email = Record[0].email;

    await generalService.findAndModifyRecord(
      TableName,
      {
        _id: Record[0]._id,
      },
      {
        password: encryptPassword,
        forgetPasswordAuthToken: "",
      }
    );

    const sent = await sendEmail(
      email,
      `Password Changed Successfully for ${process.env.PROJECT_NAME}`,
      emailTemplate.setNewPasswordSuccessfully()
    );

    if (!sent) {
      res.status(500).send({
        status: constant.ERROR,
        message: constant.PASSWORD_RESET_ERROR,
      });
    } else {
      res.status(200).send({
        status: constant.SUCCESS,
        message: constant.NEW_PASSWORD_SET_SUCCESS,
      });
    }
  } else {
    res.status(500).send({
      status: constant.SUCCESS,
      message: constant.REQUEST_EXPIRED,
    });
  }
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  let obj = req.body;

  const password = await bcrypt.hash(obj.password, saltRounds);

  const checkPassword = await generalService.getRecord(TableName, {
    _id: user._id,
  });

  await bcrypt
    .compare(obj.oldPassword, checkPassword[0].password)
    .then((result) =>
      result
        ? result
        : res.send({
            status: constant.ERROR,
            message: constant.OLD_PASSWORD_ERROR,
          })
    );

  const userObj = await generalService
    .updateRecord(
      "User",
      {
        _id: user._id,
      },
      {
        password: password,
      }
    )
    .then((value) => {
      console.log(value);
      res.send({
        status: constant.SUCCESS,
        message: constant.PASSWORD_RESET_SUCCESS,
      });
    })
    .catch((e) => {
      res.send({
        status: constant.ERROR,
        message: constant.PASSWORD_RESET_ERROR,
      });
    });
});
const authCheck = catchAsync(async (req, res, next) => {
  res.status(200).send({
    status: constant.SUCCESS,
    message: constant.USER_LOGIN_SUCCESS,
    user: req.user,
  });
});

module.exports = {
  signUp,
  signIn,
  forgetPassword,
  setNewPassword,
  changePassword,
  authCheck,
  emailCheck,
};
