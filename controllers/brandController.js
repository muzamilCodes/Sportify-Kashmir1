const { Brand } = require("../models/brandModel");
const { resHandler } = require("../utilities/resHandler");

exports.addBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return resHandler(res, 400, "Brand name is required");
    }

    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return resHandler(res, 400, "Brand already exists");
    }

    const brand = await Brand.create({ name, description });
    return resHandler(res, 201, "Brand created successfully", brand);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.editBrand = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { brandId } = req.params;

    if (!name) {
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

    brand.name = name;
    brand.description = description;
    await brand.save();

    return resHandler(res, 200, "Brand updated successfully", brand);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return resHandler(res, 404, "Brand not found");
    }

    await Brand.findByIdAndDelete(brandId);
    return resHandler(res, 200, "Brand deleted successfully");
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });

    if (brands.length > 0) {
      resHandler(res, 200, "Brands found", brands);
    } else {
      resHandler(res, 200, "No brands found", []);
    }
  } catch (error) {
    console.error(error);
    resHandler(res, 500, "Server Error!");
  }
};

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
