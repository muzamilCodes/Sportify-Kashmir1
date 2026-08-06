const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, default: "", trim: true }, // ✅ ADD THIS LINE
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    productImgUrls: [{ type: String, trim: true }],
    colors: [{ type: String, trim: true, lowercase: true }],
    sizes: [{ type: String, trim: true, uppercase: true }],
    tags: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    stock: { type: Number, min: 0, default: 0 },
    onSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };