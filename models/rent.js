'use strict';

let { Schema, model, mongoose } = require("mongoose");
const { PAYMENT_STATUS, REQUEST_STATUS, REQUEST_TYPE, RENT_STATUS,TIME_STATUS } = require("../utils/constants");
const { query } = require("express");
const path = require("path");

const rentSchema = new Schema({
    requestId: { type: Schema.Types.ObjectId, ref: 'request', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: Object.values(TIME_STATUS), required: true },
    type: { type: String, enum: Object.values(REQUEST_TYPE), default:REQUEST_TYPE.PROPERTY },
    due_status: { type: String, enum: Object.values(RENT_STATUS), default:RENT_STATUS.UNPAID },
    incomingDate: { type: Date, required: true },
    outgoingDate: { type: Date, required: true },
}, { timestamps: true });

const RentModel = model("request", rentSchema);

// create new transaction
exports.createRequest = (obj) => RentModel.create(obj)
exports.allrequest = (obj) => RentModel.find(obj)

// get all transactions
// exports.getRequest = (query) => {
//   return RequestModel.find(query)
//       .populate({
//           path: 'senderId',
//           populate: {
//               path: 'profileImage ssn_image'
//           }
//       })
//       .populate({
//           path: 'propertyId',
//           populate: {
//               path: 'media'
//           }
//       });
// };


// exports.getRequests = (id, status) => RentModel.aggregate([
//     {
  
//       $match: {
//         receiverId: mongoose.Types.ObjectId(id),
//         status: 'pending'
//       }
    
//     },
//     {
//       $lookup: {
//         from: "properties",
//         localField: "propertyId",
//         foreignField: "_id",
//         as: "RequestedProperties"
//       }
//     },
//     {
//       $unwind: "$RequestedProperties"
//     },
//     {
//       $lookup: {
//         from: "media",
//         localField: "RequestedProperties.media",
//         foreignField: "_id",
//         as: "RequestedProperties.media"
//       }
//     },
//     {
//       $group: {
//         _id: "$RequestedProperties._id",
//         property: { $first: "$RequestedProperties" }
//       }
//     },
//     {
//       $replaceRoot: { newRoot: "$property" }
//     }
//   ]
//   );
  
exports.updateRents = (id, body) => RentModel.findByIdAndUpdate(id, { $set: body})

  // find transaction
exports.findRents = (query) => RentModel.findOne(query);

exports.findRentsById = (query) => RentModel.findById(query).populate('receiverId');

// insert many transactions
exports.insertManyRents = (transactions) => RentModel.insertMany(transactions);
exports.updateMyRents = (query, update) => RentModel.updateMany(query, update);

