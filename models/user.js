const { Schema, model } = require("mongoose");
const { ROLES } = require("../utils/constants");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { sign } = require("jsonwebtoken");

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    isActive: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    coordinates: { type: { type: String }, coordinates: [Number] },
    is_completed: { type: Boolean, default: false },
    device_tokens: { type: String, default: null },
    online: { type: Boolean, default: false },
    __v: { type: Number, select: false },
  },
  { timestamps: true }
);

// index for location
userSchema.index({ location: "2dsphere" });

// add pagination plugin
userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = model("user", userSchema);

// create new user
exports.createUser = (obj) => UserModel.create(obj);

exports.findUser = (query) => UserModel.findOne(query);

exports.updateUserById = (userId, obj) =>
  UserModel.findByIdAndUpdate(userId, obj, { new: true });

// generate jwt token
exports.generateToken = (user) => {
  console.log(user);
  const token = sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
  return token;
};
