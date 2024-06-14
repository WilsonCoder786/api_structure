const { STATUS_CODE } = require("./constants");

exports.generateResponse = (data, message, res) => {
    console.log('hello',data);
    return res.status(STATUS_CODE.OK).send({
        status:true,
        data,
        message,
    });
}