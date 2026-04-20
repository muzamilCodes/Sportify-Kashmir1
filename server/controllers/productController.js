const { Product } = require("../models/productModel");
const cloudinary = require("../utilities/cloudinary");
const { resHandler } = require("../utilities/resHandler");

// exports.addProduct = async (req, res) => {
//   try {
    
//     const { name, description, price, discount, colors, sizes, tags, category, brand, stock, onSale } = req.body;

//     let colorsARR = colors ? colors.split(",") : [];
//     let sizesARR = sizes ? sizes.split(",") : [];
//     let tagsARR = tags ? tags.split(",") : [];


//    // Backend mein category validation ke baad yeh change karo (line 10-12 ke aas paas)
// if (!name || !description || !price || !category) {
//   console.log("Missing fields:", { name, description, price, category }); // Debug
//   return resHandler(res, 400, "All required fields must be provided");
// }

//     // Find category by name
//     const { Category } = require("../models/categoryModel");
//     const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
//     if (!categoryDoc) {
//       return resHandler(res, 400, "Invalid category");
//     }

//     // Find brand by name if provided
//     let brandId = null;
//     if (brand) {
//       const { Brand } = require("../models/brandModel");
//       const brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
//       if (!brandDoc) {
//         return resHandler(res, 400, "Invalid brand");
//       }
//       brandId = brandDoc._id;
//     }

//     let upload;
//     let imageUrl = "";

//     if (req.file?.path) {
//       upload = await cloudinary.uploader.upload(req.file.path);
//       imageUrl = upload.secure_url;
//       if (!upload) {
//         return resHandler(res, 500, "Image upload failed!");
//       }
//     } else {
//       return resHandler(res, 400, "Image is required");
//     }

//     let product = await Product.create({
//       name,
//       description,
//       price,
//       discount: discount || 0,
//       colors: colorsARR,
//       sizes: sizesARR,
//       tags: tagsARR,
//       productImgUrls: [imageUrl],
//       category: categoryDoc._id,
//       brand: brandId,
//       isAvailable: true,
//       isArchived: false,
//       stock: stock || 0,
//       onSale: onSale || false,
//     });

//     return resHandler(res, 201, "Product created successfully", product);
//   } catch (error) {
//     console.error(error);
//     return resHandler(res, 500, "Server Error!");
//   }
// };

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discount, colors, sizes, tags, category, brand, stock, onSale } = req.body;

    let colorsARR = colors ? colors.split(",") : [];
    let sizesARR = sizes ? sizes.split(",") : [];
    let tagsARR = tags ? tags.split(",") : [];

    if (!name || !description || !price || !category) {
      return resHandler(res, 400, "All required fields must be provided");
    }

    // ✅ FIX: Handle both category ID and category name
    const { Category } = require("../models/categoryModel");
    let categoryDoc;
    
    // Check if category is a valid MongoDB ObjectId (24 characters hex)
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isValidObjectId(category)) {
      // If category is an ID, find by _id
      categoryDoc = await Category.findById(category);
    } else {
      // If category is a name, find by name (case insensitive)
      categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
    }
    
    if (!categoryDoc) {
      return resHandler(res, 400, "Invalid category");
    }

    // Handle brand similarly (if provided)
    let brandId = null;
    if (brand) {
      const { Brand } = require("../models/brandModel");
      let brandDoc;
      
      if (isValidObjectId(brand)) {
        brandDoc = await Brand.findById(brand);
      } else {
        brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
      }
      
      if (!brandDoc) {
        return resHandler(res, 400, "Invalid brand");
      }
      brandId = brandDoc._id;
    }

    // Image upload
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

    // Create product
    let product = await Product.create({
      name,
      description,
      price,
      discount: discount || 0,
      colors: colorsARR,
      sizes: sizesARR,
      tags: tagsARR,
      productImgUrls: [imageUrl],
      category: categoryDoc._id,
      brand: brandId,
      isAvailable: true,
      isArchived: false,
      stock: stock || 0,
      onSale: onSale || false,
    });

    return resHandler(res, 201, "Product created successfully", product);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { name, description, price, discount, colors, sizes, tags, category, brand, stock, onSale } = req.body;

    // here i kept colors and sizes as comma seperated string which will gets seperated and converted to array
    let upload;
    let imageUrl = "";
    let colorsARR =
      colors !== undefined && colors !== "" ? colors.split(",") : [];
    let sizesARR = sizes !== undefined && sizes !== "" ? sizes.split(",") : [];
    let tagsARR = tags !== undefined && tags !== "" ? tags.split(",") : [];

    if (!name || !description || !price) {
      return resHandler(res, 400, "Missing required product fields");
    }
    const { productId } = req.params;
    let product = await Product.findById(productId);

    // Find category by name if provided
    let categoryId = product.category;
    if (category) {
      const { Category } = require("../models/categoryModel");
      const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      if (!categoryDoc) {
        return resHandler(res, 400, "Invalid category");
      }
      categoryId = categoryDoc._id;
    }

    // Find brand by name if provided
    let brandId = product.brand;
    if (brand) {
      const { Brand } = require("../models/brandModel");
      const brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
      if (!brandDoc) {
        return resHandler(res, 400, "Invalid brand");
      }
      brandId = brandDoc._id;
    }

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
        (product.tags = tagsARR),
        (product.category = categoryId),
        (product.brand = brandId),
        (product.productImgUrls =
          imageUrl !== "" ? [imageUrl] : product.productImgUrls),
        (product.stock = stock !== undefined ? stock : product.stock),
        (product.onSale = onSale !== undefined ? onSale : product.onSale);
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
    const products = await Product.find().populate('category', 'name').populate('brand', 'name');

    if (products.length > 0) {
      resHandler(res, 200, "Products Found", products);
    } else {
      resHandler(res, 200, "No products found", []);
    }
  } catch (error) {
    console.error(error);
    resHandler(res, 500, "Server Error!");
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

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find category by name (case insensitive)
    const { Category } = require("../models/categoryModel");
    const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });

    if (!categoryDoc) {
      return resHandler(res, 200, "No products found in this category", []);
    }

    const products = await Product.find({
      category: categoryDoc._id,
      isAvailable: true,
      isArchived: false
    }).populate('category', 'name').populate('brand', 'name');

    if (products.length > 0) {
      resHandler(res, 200, "Products Found", products);
    } else {
      resHandler(res, 200, "No products found in this category", []);
    }
  } catch (error) {
    console.error(error);
    resHandler(res, 500, "Server Error!");
  }
};

exports.getSaleProducts = async (req, res) => {
  try {
    const products = await Product.find({
      onSale: true,
      isAvailable: true,
      isArchived: false
    }).populate('category', 'name').populate('brand', 'name');

    if (products.length > 0) {
      resHandler(res, 200, "Sale Products Found", products);
    } else {
      resHandler(res, 200, "No sale products found", []);
    }
  } catch (error) {
    console.error(error);
    resHandler(res, 500, "Server Error!");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return resHandler(res, 404, "Product not found");
    }

    await Product.findByIdAndDelete(productId);
    return resHandler(res, 200, "Product deleted successfully");
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};
// Temporary debug route
exports.debugProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    const formatted = products.map(p => ({
      name: p.name,
      categoryId: p.category?._id,
      categoryName: p.category?.name,
      rawCategory: p.category
    }));
    res.json({
      total: products.length,
      products: formatted,
      message: "Check if category names are correct"
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};