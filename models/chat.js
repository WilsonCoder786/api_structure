'use strict';

const { Schema, model, Types } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { getMongooseAggregatePaginatedData } = require("../utils/index");

const chatSchema = new Schema({
    users: [{ type: Types.ObjectId, ref: "user", required: true }],
    channel: { type: String, required: true },
    lastMessage: { type: Types.ObjectId, ref: "message" },
    deletedBy: { type: Types.ObjectId, ref: "user" },
}, { timestamps: true });

chatSchema.plugin(mongoosePaginate);
chatSchema.plugin(aggregatePaginate);

const ChatModel = model("Chat", chatSchema);

// create new chat
exports.createChat = (obj) => ChatModel.create(obj);

// update last message in chat
exports.updateChat = (query, obj) => ChatModel.updateOne(query, obj, { new: true });

// find chats by query
exports.findChats = async ({ query, page, limit }) => {
    const { data, pagination } = await getMongooseAggregatePaginatedData({
        model: ChatModel,
        query,
        page,
        limit,
        sort: { updatedAt: -1 }

    });

    return { result: data, pagination };
}

// find chat by query
exports.findChat = (query) => ChatModel.findOne(query).populate('users lastMessage');

// remove chat-box
exports.removeChat = (id) => ChatModel.findByIdAndDelete(id);