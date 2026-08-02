const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },

    description: { type: String, trim: true },

    price: { type: Number, required: true, min: 0 },

    discount: { type: Number, min: 0, max: 100, default: 0 },

    productImgUrls: [{ type: String, trim: true }],

    colors: [{ type: String, trim: true, lowercase: true }],

    sizes: [{ type: String, trim: true, uppercase: true }],

    isAvailable: { type: Boolean, default: true },

    isArchived: { type: Boolean, default: false },

    category: { type: String, trim: true, default: "Fruits" },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
