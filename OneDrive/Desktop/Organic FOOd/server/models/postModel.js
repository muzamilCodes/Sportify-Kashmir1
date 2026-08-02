const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    postTitle: { type: String, required: true, trim: true, maxlength: 200 },
    postDesc: { type: String, required: true },
    shortDesc: { type: String, trim: true, maxlength: 300 },
    postImgUrl: { type: String },
    postAuthorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: [{ type: String, trim: true, lowercase: true }],
    hashTags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
