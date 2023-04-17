const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    postId: { type: String, unique: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    tags: [{ type: String }],
    likes: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
