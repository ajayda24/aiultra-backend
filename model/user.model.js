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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const postSchema = new Schema(
  {
    postId: { type: String, unique: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userImage: { type: String, required: true },
    email: { type: String, required: true },
    tags: [{ type: String }],
    likes: Number,
    likedUsers: [{ type: String }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "email",
  foreignField: "email",
});
userSchema.virtual("likedPosts", {
  ref: "Post",
  localField: "email",
  foreignField: "likedUsers",
});

module.exports = {
  UserModel: mongoose.model("User", userSchema),
  PostModel: mongoose.model("Post", postSchema),
};
