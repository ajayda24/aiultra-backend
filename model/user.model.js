const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    userImage: String,
    socialAuth: [
      {
        providerId: String,
        authId: String,
        picture: String,
      },
    ],

    dob: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
