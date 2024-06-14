'use strict';

const { generateResponse } = require("../utils");

exports.register = async (req, res, next) => {
    generateResponse({}, 'OTP is sent to your email, please verify your account to login..', res);
}
