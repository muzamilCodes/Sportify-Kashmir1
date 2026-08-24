const mongoose = require("mongoose");
require("./categoryModel");
require("./brandModel");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true, uppercase: true },
    weight: { type: String, trim: true }, // e.g. "1180g - 1220g"
    color: { type: String, trim: true, lowercase: true },
    sku: { type: String, trim: true, uppercase: true },
    price: { type: Number, min: 0 },
    stock: { type: Number, min: 0, default: 0 },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: String, default: "", trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    productImgUrls: [{ type: String, trim: true }],
    colors: [{ type: String, trim: true, lowercase: true }],
    sizes: [{ type: String, trim: true, uppercase: true }],
    variants: [variantSchema],
    tags: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    stock: { type: Number, min: 0, default: 0 },
    onSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ isArchived: 1, isAvailable: 1, createdAt: -1 });
productSchema.index({ category: 1, brand: 1, price: 1 });
productSchema.index({ stock: 1, isAvailable: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
