const StockNotification = require("../models/stockNotificationModel");
const { Product } = require("../models/productModel");

exports.subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Valid email is required" });
    const product = await Product.findById(req.params.productId).select("_id stock isAvailable");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock > 0 && product.isAvailable) return res.status(400).json({ success: false, message: "This product is already in stock" });
    await StockNotification.findOneAndUpdate({ product: product._id, email }, { product: product._id, email, notifiedAt: null }, { upsert: true, new: true });
    res.status(201).json({ success: true, message: "We will notify you when this is back in stock" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
