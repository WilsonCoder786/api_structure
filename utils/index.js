const { STATUS_CODE } = require("./constants");

exports.generateResponse = (data, message, res) => {
    return res.status(STATUS_CODE.OK).send({
        status:true,
        data,
        message,
    });
}


exports.generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}


exports.parseBody = (body) => {
    let obj;
    if (typeof body === "object") obj = body;
    else obj = JSON.parse(body);
    return obj;
}