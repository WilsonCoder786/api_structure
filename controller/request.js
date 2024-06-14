const {
  createRequest,
  findRequestById,
  getRequest,
  findRequest,
  insertManyRequest,
  updateRequest,
  getRequests,
  updateMyProperties,
  allrequest,
} = require("../models/request");
const { findPropertybyId, updateProperty, getPropertyForOwner, PropertyModel } = require("../models/property");
const { generateResponse, parseBody } = require("../utils");
const {
  REQUEST_STATUS,
  PROPERTY_STATUS,
  STATUS_CODE,
} = require("../utils/constants");
const { findUser } = require("../models/user");
const { sendRequest } = require("../socket");

exports.sendRequest = async (req, res, next) => {
  try {
    const { receiverId, propertyId, inComingDate, outGoingDate } = parseBody(
      req.body
    );

    const userExists = await findUser({ _id: req.user.id });
    let Request = await findRequest({
      senderId: req.user.id,
      receiverId: receiverId,
      propertyId:propertyId,
      status: REQUEST_STATUS.PENDING,
    });
    let property = await findRequest({
      propertyId: propertyId,
      status:REQUEST_STATUS.ACCEPTED 
    })
    console.log('this is list>>>>>>>>>>>>>>>>>>>>>>',property);
    if (property) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "property occupied by another user",
      });
    }
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    if (Request) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request Already Send",
      });
    }

    let Property = await findPropertybyId(propertyId);

    if (!Property) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }

    if (Property && Property.status == PROPERTY_STATUS.OCCUPIED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Property is occupied ",
      });
    }

    let data = await createRequest({
      senderId: req.user.id,
      propertyId: propertyId,
      receiverId: receiverId,
      status: REQUEST_STATUS.PENDING,
      incomingDate: inComingDate, // ISO 8601 format 2024-05-01T00:00:00Z
      outgoingDate: outGoingDate, // ISO 8601 format 2024-05-15T00:00:00Z
    });

    let receiverRequests = await getRequests({
      id: receiverId,
      status: REQUEST_STATUS.PENDING,
    });
    if (receiverRequests) {
      sendRequest(receiverId, receiverRequests);
    }
    generateResponse(data, "Property Request is succesfully Created", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.acceptRejectRequest = async (req, res, next) => {
  const { requestId, status } = parseBody(req.body);
  try {
    let request = await findRequestById(requestId);
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    if (!request) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request not found",
      });
    }

    // if (request && request.status == REQUEST_STATUS.ACCEPTED) {
    //   return next({
    //     statusCode: STATUS_CODE.BAD_REQUEST,
    //     message: "Request already accepted",
    //   });
    // }

    if (request && request.status == REQUEST_STATUS.REJECTED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request is rejected",
      });
    }

    await updateProperty(request.PROPERTY_STATUSid, {
      status: PROPERTY_STATUS.OCCUPIED,
    });

    if (status == REQUEST_STATUS.REJECTED) {
      let data = await updateRequest(request._id, {
        status: status,
      });
      generateResponse([], "Property Request is Rejected", res);
    }

    // if (data) {
    //   let receiverRequests = await getRequests({
    //     id: request.receiverId,
    //     status: REQUEST_STATUS.PENDING,
    //   });
    //   sendRequest(request.receiverId, receiverRequests);
    // }

    if (status == REQUEST_STATUS.ACCEPTED) {
      let ids = await allrequest({});

      let data = await updateRequest(request._id, {
        status: status,
      });
      console.log(data._id)
      let value = data._id.toString()
      let resData = await getPropertyForOwner({_id: value});

      console.log(resData);
      for (const id of ids) {
        console.log(id._id, request._id);
        if (id._id.toString() !== request._id.toString()) {
          await updateRequest(id._id, { status: "rejected" });
        }
      }
      generateResponse(
        resData,
        "Property Request is succesfully Accepted",
        res
      );
    }
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.cancleRequest = async (req, res, next) => {
  const { requestId } = parseBody(req.body);
  try {
    let request = await findRequestById(requestId);

    if (!request) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request not found",
      });
    }

    if (request && request.status == REQUEST_STATUS.ACCEPTED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request already accepted",
      });
    }

    if (request && request.status == REQUEST_STATUS.REJECTED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request is rejected",
      });
    }

    let data = await updateRequest(request.id, {
      status: REQUEST_STATUS.CANCELED,
    });
    let resData = await findRequestById(data._id);
    if (data) {
      let receiverRequests = await getRequests({
        id: request.receiverId,
        status: REQUEST_STATUS.PENDING,
      });

      sendRequest(request.receiverId, receiverRequests);
    }
    generateResponse(resData, "Request is succesfully canceled", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    let senderRequests = await getRequest({
      senderId: req.user.id,
      status: REQUEST_STATUS.PENDING,
    });

    if (!senderRequests) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }
    generateResponse(
      senderRequests,
      "Property Request is succesfully Retrieved",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getPropertyRequestss = async (req, res, next) => {
  try {
    const { propertyId } = req.query;
    const userExists = await findUser({ _id: req.user.id });
    console.log(propertyId);
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    let senderRequests = await getRequest({
      receiverId: req.user.id,
      status: REQUEST_STATUS.PENDING,
      propertyId: propertyId,
    });

    if (!senderRequests) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }
    generateResponse(
      senderRequests,
      "Property Request is succesfully Retrieved",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};
exports.getPropertyRequests = async (req, res, next) => {
  try {
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    let senderRequests = await getRequests({
      id: req.user.id,
      status: REQUEST_STATUS.PENDING,
    });

    if (!senderRequests) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }
    generateResponse(
      senderRequests,
      "Property Request is succesfully Retrieved",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};
