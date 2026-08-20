const fs = require("fs");
const path = require("path");
const { Product } = require("../models/productModel");
const cloudinary = require("../utilities/cloudinary");
const { resHandler } = require("../utilities/resHandler");

const uploadProductImage = async (file) => {
  if (!file) return null;

  // 1. Attempt Cloudinary upload if credentials are provided
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

  // 2. Fallback to local static upload storage (/uploads/filename)
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

    const imageUrls = [];

    // Accept raw URLs passed directly via body
    if (req.body.productImgUrls) {
      const rawUrls = Array.isArray(req.body.productImgUrls)
        ? req.body.productImgUrls
        : req.body.productImgUrls.split(",").map((s) => s.trim()).filter(Boolean);
      imageUrls.push(...rawUrls);
    } else if (req.body.imageUrls) {
      const rawUrls = Array.isArray(req.body.imageUrls)
        ? req.body.imageUrls
        : req.body.imageUrls.split(",").map((s) => s.trim()).filter(Boolean);
      imageUrls.push(...rawUrls);
    }

    for (const file of files) {
      const url = await uploadProductImage(file);
      if (url) imageUrls.push(url);
    }

    if (imageUrls.length === 0) {
      return resHandler(res, 400, "At least 1 product image is required (3 recommended)");
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
    const { name, description, price, discount, colors, sizes, tags, category, brand, stock, onSale, existingImages, productImgUrls, imageUrls } = req.body;
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

    // Process retained existing images
    let finalImages = [];
    const rawExisting = existingImages !== undefined ? existingImages : (productImgUrls !== undefined ? productImgUrls : imageUrls);
    if (rawExisting !== undefined) {
      if (Array.isArray(rawExisting)) {
        finalImages = rawExisting.filter(Boolean);
      } else if (typeof rawExisting === "string" && rawExisting.trim()) {
        finalImages = rawExisting.split(",").map(s => s.trim()).filter(Boolean);
      }
    } else {
      finalImages = [...(product.productImgUrls || [])];
    }

    // Process new image files
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
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 24, 1), 100);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || "").trim();
    const query = {};
    if (search) query.$text = { $search: search };
    if (req.query.category) query.category = req.query.category;
    if (req.query.brand) query.brand = req.query.brand;
    if (req.query.available === "true") query.isAvailable = true;
    if (req.query.inStock === "true") query.stock = { $gt: 0 };
    if (req.query.available === "true" || req.query.inStock === "true") query.isArchived = false;

    let productsQuery = Product.find(query).populate('category', 'name').populate('brand', 'name').sort({ createdAt: -1 });
    if (hasPagination) productsQuery = productsQuery.skip(skip).limit(limit);
    const products = await productsQuery.lean();
    const total = hasPagination && req.query.includeTotal !== "false" ? await Product.countDocuments(query) : products.length;

    if (products.length > 0) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      resHandler(res, 200, "Products Found", hasPagination ? { items: products, page, limit, total, pages: Math.ceil(total / limit) } : products);
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

    const product = await Product.findById(productId)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    if (product) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
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
    const cleanCategory = decodeURIComponent(category).trim();
    const regexPattern = `^${cleanCategory.replace(/[-_]/g, "[-_\\s&/]*")}$`;
    let categoryDoc = await Category.findOne({
      name: { $regex: new RegExp(regexPattern, "i") },
    });

    if (!categoryDoc) {
      categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(cleanCategory.replace(/[-_]/g, ".*"), "i") },
      });
    }

    if (!categoryDoc) {
      return resHandler(res, 200, "No products found in this category", []);
    }

    const products = await Product.find({
      category: categoryDoc._id,
      isAvailable: true,
      isArchived: false
    }).populate('category', 'name').populate('brand', 'name').sort({ createdAt: -1 });

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
      $or: [
        { onSale: true },
        { discount: { $gt: 0 } },
      ],
      isAvailable: true,
      isArchived: false,
    })
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ discount: -1, createdAt: -1 });

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

    if (!productId) {
      return resHandler(res, 400, "Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return resHandler(res, 404, "Product not found or already deleted");
    }

    await Product.findByIdAndDelete(productId);

    // Clean up references from user carts so invalid product IDs are not retained
    try {
      const { Cart } = require("../models/cartModel");
      if (Cart) {
        await Cart.updateMany(
          {},
          { $pull: { products: { productId: productId } } }
        );
      }
    } catch (cartErr) {
      console.warn("Notice: Could not clean cart refs on product delete:", cartErr.message);
    }

    return resHandler(res, 200, "Product deleted successfully");
  } catch (error) {
    console.error("Delete product error:", error);
    return resHandler(res, 500, error.message || "Server Error!");
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
