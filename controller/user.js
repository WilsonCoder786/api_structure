"use strict";

const { deleteOTPs, addOTP } = require("../models/otp");
const { findUser, createUser, generateToken } = require("../models/user");
const { generateResponse, parseBody, generateRandomOTP } = require("../utils");
const { STATUS_CODE } = require("../utils/constants");
const { registerUserValidation } = require("../validations/userValidator");
const { compare, hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

exports.register = async (req, res, next) => {
  try {
    const body = parseBody(req.body);
    const { error } = registerUserValidation.validate(body);

    if (error) {
      const errorMessage =
        error.details && error.details[0]
          ? error.details[0].message
          : "Validation error";
      return next({
        status: false,
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: errorMessage,
      });
    }

    try {
      const userExists = await findUser({ email: body.email });

      if (userExists)
        return next({
          data: {},
          statusCode: STATUS_CODE.BAD_REQUEST,
          message: "User already exists",
        });
      const hashedPassword = await hash(body.password, 10);
      body.password = hashedPassword;

      const user = await createUser(body);

      const token = generateToken(user);

      await deleteOTPs(body.email);

      const newOtp = generateRandomOTP();

      const otpObj = await addOTP({
        otp: newOtp,
        email: body.email,
      });
      await sendEmail(
        body.email,
        "Account Created Successfully ",
        `Your OTP is ${otpObj.otp}`
      );
      generateResponse(
        { user, otp: otpObj.otp, token },
        "OTP is sent to your email, please verify your account to login..",
        res
      );
    } catch (e) {
      next(new Error(e));
    }
  } catch (err) {
    next(err);
  }
};

exports.verifytoken = async (req, res, next) => {
  try {
    const body = parseBody(req.body);
    const tokenHeader = req.headers["token"];
    if (!tokenHeader)
      return next({
        status: false,
        statusCode: STATUS_CODE.UNAUTHORIZED,
        message: "Token header not found",
      });

    jwt.verify(tokenHeader, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next({
          status: false,
          statusCode: STATUS_CODE.UNAUTHORIZED,
          message: "Invalid token",
        });
      }
      const User = await findUser({ _id: decoded.id });
      if (!User) {
        return next({
          status: false,
          statusCode: STATUS_CODE.UNAUTHORIZED,
          message: "Invalid token",
        });
      }
      generateResponse(
        User,
        "OTP is sent to your email, please verify your account to login..",
        res
      );
    });
  } catch (err) {
    next(err);
  }
};

exports.createProfile = async (req, res, next) => {
  try {
    generateResponse(
      req.user,
      "OTP is sent to your email, please verify your account to login..",
      res
    );
  } catch (e) {
    return next({
      status: false,
      statusCode: STATUS_CODE.UNAUTHORIZED,
      message: "Invalid token",
    });
  }
};
