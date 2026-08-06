const { Post } = require("../models/postModel");
const cloudinary = require("../utilities/cloudinary");
const { resHandler } = require("../utilities/resHandler");

// Add Post
exports.addPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { postTitle, shortDesc, postDesc } = req.body;

    if (!postTitle || !postDesc) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    let imageUrl = null;
    
    if (req.file) {
      try {
        const upload = await cloudinary.uploader.upload(req.file.path);
        imageUrl = upload.secure_url;
      } catch (error) {
        console.error("Upload error:", error);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const post = await Post.create({
      postTitle,
      shortDesc: shortDesc || postDesc.substring(0, 150),
      postDesc,
      postImgUrl: imageUrl,
      postAuthorId: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postAuthorId", "username email")
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      message: "Posts fetched",
      posts: posts
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get Single Post
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("postAuthorId", "username");
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Post found",
      post: post
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByIdAndDelete(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { postTitle, shortDesc, postDesc } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    let imageUrl = post.postImgUrl;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      imageUrl = upload.secure_url;
    }

    post.postTitle = postTitle || post.postTitle;
    post.shortDesc = shortDesc || post.shortDesc;
    post.postDesc = postDesc || post.postDesc;
    post.postImgUrl = imageUrl;
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};