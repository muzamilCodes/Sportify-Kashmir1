const { Brand } = require("../models/brandModel");
const { resHandler } = require("../utilities/resHandler");

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    
    if (brands.length > 0) {
      return resHandler(res, 200, "Brands found", brands);
    } else {
      return resHandler(res, 200, "No brands found", []);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findById(brandId);
    
    if (brand) {
      return resHandler(res, 200, "Brand found", brand);
    } else {
      return resHandler(res, 404, "Brand not found");
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Add new brand
exports.addBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return resHandler(res, 400, "Brand name is required");
    }

    // Check if brand already exists (case insensitive)
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingBrand) {
      return resHandler(res, 400, "Brand already exists");
    }

    const brand = await Brand.create({
      name: name.trim(),
      description: description || "",
    });

    return resHandler(res, 201, "Brand created successfully", brand);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Edit brand
exports.editBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return resHandler(res, 400, "Brand name is required");
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return resHandler(res, 404, "Brand not found");
    }

    // Check if name is taken by another brand
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: brandId }
    });
    
    if (existingBrand) {
      return resHandler(res, 400, "Brand name already exists");
    }

    brand.name = name.trim();
    brand.description = description || "";
    await brand.save();

    return resHandler(res, 200, "Brand updated successfully", brand);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return resHandler(res, 404, "Brand not found");
    }

    // Check if brand has products
    const { Product } = require("../models/productModel");
    const productsCount = await Product.countDocuments({ brand: brandId });
    
    if (productsCount > 0) {
      return resHandler(res, 400, `Cannot delete brand with ${productsCount} products. Move or delete products first.`);
    }

    await Brand.findByIdAndDelete(brandId);
    return resHandler(res, 200, "Brand deleted successfully");
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};