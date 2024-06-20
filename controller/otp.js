const { getOTP, deleteOTPs, addOTP } = require("../models/otp");
const { findUser, generateToken, updateUserById } = require("../models/user");
const { generateResponse, parseBody, generateRandomOTP } = require("../utils");
const { STATUS_CODE } = require("../utils/constants");
const { sendEmail } = require("../utils/sendEmail");

exports.generateOTP = async (req, res, next) => {
  const { email } = parseBody(req.body);
  if (!email)
    return next({
      data: { status: false },
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "Email is required",
    });

  try {
    const user = await findUser({ email });
    if (!user)
      return next({
        data: { status: false },
        statusCode: STATUS_CODE.NOT_FOUND,
        message: "User not found",
      });

    // delete all previous OTPs
    await deleteOTPs(email);

    const otpObj = await addOTP({
      email,
      otp: generateRandomOTP(),
    });

    // send email
    const token = generateToken(user);
    await sendEmail(email, "New Otp", `Your OTP is ${otpObj.otp}`);

    generateResponse({ otp: otpObj, token }, "OTP generated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.verifyOtp = async (req, res, next) => {
  const { otp } = parseBody(req.body);
  try {
    if (!otp) {
      return next({
        status: false,
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: "OTP is required",
      });
    }
    const otpObj = await getOTP({ otp });
    if (!otpObj) {
      return next({
        status: false,
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: "OTP not found",
      });
    }

    if (otpObj.isExpired())
      return next({
        status: false,
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "OTP expired",
      });

    const existingUser = await findUser({ email: otpObj.email });
    if (!existingUser)
      return next({
        status: false,
        statusCode: STATUS_CODE.NOT_FOUND,
        message: "User not found",
      });

    // update user isVerified to true
    const User = await updateUserById(existingUser._id, { is_verified: true });

    const token = generateToken(existingUser);
    await sendEmail(otpObj.email, "Account Verify Successfully ", ``);
    generateResponse({ User, token }, "Email Verification successful!", res);
  } catch (e) {
    return next({
      status: false,
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: e,
    });
  }
};
