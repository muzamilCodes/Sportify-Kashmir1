const fs = require("fs");
const path = require("path");
const { Product } = require("../models/productModel");
const cloudinary = require("../utilities/cloudinary");
const { resHandler } = require("../utilities/resHandler");

const uploadProductImage = async (file) => {
  if (!file) return null;

  if (process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET) {
    try {
      if (file.path) {
        const uploadPromise = cloudinary.uploader.upload(file.path, {
          folder: "sportify/products",
          resource_type: "image",
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Cloudinary upload timeout (10s)")), 10000)
        );
        const uploadRes = await Promise.race([uploadPromise, timeoutPromise]);
        if (uploadRes && uploadRes.secure_url) {
          return uploadRes.secure_url;
        }
      } else if (file.buffer) {
        const uploadRes = await new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Cloudinary stream timeout (10s)")),
            10000
          );
          const stream = cloudinary.uploader.upload_stream(
            { folder: "sportify/products", resource_type: "image" },
            (error, result) => {
              clearTimeout(timeout);
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        if (uploadRes && uploadRes.secure_url) {
          return uploadRes.secure_url;
        }
      }
    } catch (err) {
      const errMsg = err?.message || err?.error?.message || String(err);
      console.warn("⚠️ Cloudinary upload issue, falling back to local file storage:", errMsg);
    }
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  if (file.buffer) {
    try {
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = path.extname(file.originalname || ".jpg") || ".jpg";
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      return `/uploads/${filename}`;
    } catch (fsErr) {
      console.error("Local disk storage error:", fsErr);
    }
  }

  throw new Error("Failed to process uploaded image file");
};

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discount, colors, sizes, tags, category, brand, stock, onSale } = req.body;

    let colorsARR = colors ? (Array.isArray(colors) ? colors : colors.split(",").map(s => s.trim()).filter(Boolean)) : [];
    let sizesARR = sizes ? (Array.isArray(sizes) ? sizes : sizes.split(",").map(s => s.trim()).filter(Boolean)) : [];
    let tagsARR = tags ? (Array.isArray(tags) ? tags : tags.split(",").map(s => s.trim()).filter(Boolean)) : [];

    if (!name || !price || !category) {
      return resHandler(res, 400, "All required fields must be provided");
    }

    const { Category } = require("../models/categoryModel");
    let categoryDoc;
    const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isValidObjectId(category)) {
      categoryDoc = await Category.findById(category);
    } else {
      categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
    }
    
    if (!categoryDoc) {
      return resHandler(res, 400, "Invalid category");
    }

    let brandId = null;
    if (brand) {
      const { Brand } = require("../models/brandModel");
      let brandDoc;
      if (isValidObjectId(brand)) {
        brandDoc = await Brand.findById(brand);
      } else {
        brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
      }
      if (brandDoc) {
        brandId = brandDoc._id;
      }
    }

    let files = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      files = Object.values(req.files).flat();
    } else if (req.file) {
      files = [req.file];
    }

    files = files.filter(
      (file) => file && (file.mimetype ? file.mimetype.startsWith("image/") : true)
    );
    
    if (files.length < 3) {
      return resHandler(res, 400, `At least 3 product images are required (received ${files.length})`);
    }

    const imageUrls = [];
    for (const file of files) {
      const url = await uploadProductImage(file);
      if (url) imageUrls.push(url);
    }

    if (imageUrls.length === 0) {
      return resHandler(res, 400, "At least 3 product images are required");
    }

    let product = await Product.create({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      colors: colorsARR,
      sizes: sizesARR,
      tags: tagsARR,
      productImgUrls: imageUrls,
      category: categoryDoc._id,
      brand: brandId,
      isAvailable: req.body.isAvailable !== undefined ? (req.body.isAvailable === "true" || req.body.isAvailable === true) : true,
      isArchived: req.body.isArchived !== undefined ? (req.body.isArchived === "true" || req.body.isArchived === true) : false,
      stock: stock ? Number(stock) : 0,
      onSale: req.body.onSale !== undefined ? (req.body.onSale === "true" || req.body.onSale === true) : false,
    });

    return resHandler(res, 201, "Product created successfully", product);
  } catch (error) {
    console.error("Error in addProduct:", error);
    const msg = error?.message || error?.error?.message || "Server Error";
    return resHandler(res, 500, `Product creation failed: ${msg}`);
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { name, description, price, discount, colors, sizes, tags, category, brand, stock, onSale, existingImages } = req.body;
    const { productId } = req.params;

    let product = await Product.findById(productId);
    if (!product) {
      return resHandler(res, 404, "Product not found!");
    }

    let colorsARR = colors !== undefined ? (Array.isArray(colors) ? colors : colors ? colors.split(",").map(s => s.trim()).filter(Boolean) : []) : product.colors;
    let sizesARR = sizes !== undefined ? (Array.isArray(sizes) ? sizes : sizes ? sizes.split(",").map(s => s.trim()).filter(Boolean) : []) : product.sizes;
    let tagsARR = tags !== undefined ? (Array.isArray(tags) ? tags : tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : []) : product.tags;

    const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

    let categoryId = product.category;
    if (category) {
      const { Category } = require("../models/categoryModel");
      let categoryDoc;
      if (isValidObjectId(category)) {
        categoryDoc = await Category.findById(category);
      } else {
        categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }
      if (categoryDoc) {
        categoryId = categoryDoc._id;
      }
    }

    let brandId = product.brand;
    if (brand !== undefined) {
      if (!brand || brand === "null" || brand === "") {
        brandId = null;
      } else {
        const { Brand } = require("../models/brandModel");
        let brandDoc;
        if (isValidObjectId(brand)) {
          brandDoc = await Brand.findById(brand);
        } else {
          brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
        }
        if (brandDoc) {
          brandId = brandDoc._id;
        }
      }
    }

    let finalImages = [];
    if (existingImages !== undefined) {
      if (Array.isArray(existingImages)) {
        finalImages = existingImages.filter(Boolean);
      } else if (typeof existingImages === "string" && existingImages.trim()) {
        finalImages = existingImages.split(",").map(s => s.trim()).filter(Boolean);
      }
    } else {
      finalImages = [...(product.productImgUrls || [])];
    }

    let files = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      files = Object.values(req.files).flat();
    } else if (req.file) {
      files = [req.file];
    }

    files = files.filter(
      (file) => file && (file.mimetype ? file.mimetype.startsWith("image/") : true)
    );

    for (const file of files) {
      const url = await uploadProductImage(file);
      if (url) finalImages.push(url);
    }

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (colorsARR !== undefined) product.colors = colorsARR;
    if (sizesARR !== undefined) product.sizes = sizesARR;
    if (tagsARR !== undefined) product.tags = tagsARR;
    if (categoryId) product.category = categoryId;
    product.brand = brandId;
    if (finalImages.length > 0) product.productImgUrls = finalImages;
    if (stock !== undefined) product.stock = Number(stock);
    if (onSale !== undefined) product.onSale = (onSale === "true" || onSale === true);
    if (req.body.isAvailable !== undefined) product.isAvailable = (req.body.isAvailable === "true" || req.body.isAvailable === true);
    if (req.body.isArchived !== undefined) product.isArchived = (req.body.isArchived === "true" || req.body.isArchived === true);

    await product.save();
    return resHandler(res, 200, "Product updated successfully!", product);
  } catch (error) {
    console.error("Error in editProduct:", error);
    const msg = error?.message || error?.error?.message || "Server Error";
    return resHandler(res, 500, `Product update failed: ${msg}`);
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
