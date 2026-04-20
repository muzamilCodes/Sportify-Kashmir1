const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    postTitle: { type: String, required: true, trim: true },
    postDesc: { type: String, required: true },
    shortDesc: { type: String, trim: true },
    postImgUrl: { type: String },
    postAuthorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: [{ type: String, trim: true }],
    hashTags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };