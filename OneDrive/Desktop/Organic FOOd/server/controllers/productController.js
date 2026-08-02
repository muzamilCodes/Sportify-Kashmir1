const { Product } = require("../models/productModel");
const cloudinary = require("../utilities/cloudinary");
const { resHandler } = require("../utilities/resHandler");

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discount, colors, sizes } = req.body;

    let colorsARR = colors ? colors.split(",") : [];
    let sizesARR = sizes ? sizes.split(",") : [];

    if (!name || !description || !price) {
      return resHandler(res, 400, "All required fields must be provided");
    }

    let upload;
    let imageUrl = "";

    if (req.file?.path) {
      upload = await cloudinary.uploader.upload(req.file.path);
      imageUrl = upload.secure_url;
      if (!upload) {
        return resHandler(res, 500, "Image upload failed!");
      }
    } else {
      return resHandler(res, 400, "Image is required");
    }

    let product = await Product.create({
      name,
      description,
      price,
      discount,
      colors: colorsARR,
      sizes: sizesARR,
      productImgUrls: [imageUrl],
    });

    return resHandler(res, 201, "Product created successfully", product);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};


exports.editProduct = async (req, res) => {
  try {
    const { name, description, price, discount, colors, sizes } = req.body;

    // here i kept colors and sizes as comma seperated string which will gets seperated and converted to array
    let upload;
    let imageUrl = "";
    let colorsARR =
      colors !== undefined && colors !== "" ? colors.split(",") : [];
    let sizesARR = sizes !== undefined && sizes !== "" ? sizes.split(",") : [];

    if (!name || !description || !price) {
      return resHandler(res, 400, "Missing required product fields");
    }
    const { productId } = req.params;
    let product = await Product.findById(productId);

    if (req.file?.path) {
      const image = req.file.path;
      upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
      if (!upload) {
        return resHandler(res, 500, "image Upload Failed!");
      }
    }

    if (product) {
      (product.name = name),
        (product.description = description),
        (product.price = price),
        (product.discount = discount),
        (product.colors = colorsARR),
        (product.sizes = sizesARR),
        (product.productImgUrls =
          imageUrl !== "" ? [imageUrl] : product.productImgUrls);
      await product.save();
      return resHandler(res, 200, "Product updated!", product);
    } else {
      return resHandler(res, 404, "Product not Found!");
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.archive_UnArchiveProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    let product = await Product.findById(productId);

    if (product.isArchived === false) {
      product.isArchived = true;
      await product.save();

      return resHandler(res, 200, "Product Archived!", product);
    } else if (product.isArchived === true) {
      product.isArchived = false;
      await product.save();

      return resHandler(res, 200, "Product Unarchived!", product);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.isAvailOrNot = async (req, res) => {  
  try {
    const { productId } = req.params;

    let product = await Product.findById(productId);

    if (product.isAvailable === false) {
      product.isAvailable = true;
      await product.save();

      return resHandler(res, 200, "Product is Available!", product);
    } else if (product.isAvailable === true) {
      product.isAvailable = false;
      await product.save();

      return resHandler(res, 400, "Product not Available!", product);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return resHandler(res, 200, "Products Found", products || []);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (product) {
      return resHandler(res, 200, "Product Found!", product);
    } else {
      return resHandler(res, 404, "Product not Found!");
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};
