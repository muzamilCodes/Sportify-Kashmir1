const { Post } = require("../models/postModel");
const cloudinary = require("../utilities/cloudinary");

exports.addPost = async (req, res) => {
  try {
    // logic for authorisation   // it should be in dedicated middle ware

    const { postTitle, postDesc, shortDesc, image } = req.body;
    const postAuthorId = req.userId;
    // let image = req.body.image
    // let image = req.file.path  // when the image is a binary  file and not base 64 url encoded

    // console.log(image)
    // if (image === "") {
    //   return res.status(400).json({message : "Image File missing!"})
    // }

    if (postTitle === "" || postDesc === "" || shortDesc === "") {
      return res.status(400).json({ message: "Feilds with * are required!" });
    }

    // upload  image to cloudinary  to get secure Url  which will return secure url

    const upload = await cloudinary.uploader.upload(image);

    const secureUrl = upload.secure_url;

    const newPost = await Post.create({
      postTitle,
      postDesc,
      shortDesc,
      postImgUrl: secureUrl,
      postAuthorId,
    });
    
    if (newPost) {
      res.status(201).json({ message: "Post uploaded!" });
    } else {
      res.status(500).json({ message: "Some Error !" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find(); //db se posts ko find kiya

    if (posts.length > 0) {
      res.status(200).json({ posts });
    } else {
      res.status(404).json({ message: "No posts Found!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!" });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // const postId = req.params.postId

    const post = await Post.findById(postId);

    if (post) {
      res.status(200).json({ post });
    } else {
      res.status(404).json({ message: "Post not Found!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!" });
  }
};

exports.editPost = async(req,res) =>{
  try {
    
  } catch (error) {
    
  }
}