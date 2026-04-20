const { Category } = require("../models/categoryModel");
const { resHandler } = require("../utilities/resHandler");

exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return resHandler(res, 400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return resHandler(res, 400, "Category already exists");
    }

    const category = await Category.create({ name, description });
    return resHandler(res, 201, "Category created successfully", category);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { categoryId } = req.params;

    if (!name) {
      return resHandler(res, 400, "Category name is required");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return resHandler(res, 404, "Category not found");
    }

    // Check if name is taken by another category
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: categoryId }
    });
    if (existingCategory) {
      return resHandler(res, 400, "Category name already exists");
    }

    category.name = name;
    category.description = description;
    await category.save();

    return resHandler(res, 200, "Category updated successfully", category);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return resHandler(res, 404, "Category not found");
    }

    await Category.findByIdAndDelete(categoryId);
    return resHandler(res, 200, "Category deleted successfully");
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    if (categories.length > 0) {
      resHandler(res, 200, "Categories found", categories);
    } else {
      resHandler(res, 200, "No categories found", []);
    }
  } catch (error) {
    console.error(error);
    resHandler(res, 500, "Server Error!");
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (category) {
      return resHandler(res, 200, "Category found", category);
    } else {
      return resHandler(res, 404, "Category not found");
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};
