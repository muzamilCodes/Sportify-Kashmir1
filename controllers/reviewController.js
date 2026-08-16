const Review = require("../models/reviewModel");
const { Product } = require("../models/productModel");

exports.list = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate("user", "username profilePic").sort({ createdAt: -1 }).lean();
    const summary = reviews.reduce((acc, review) => { acc.count += 1; acc.total += review.rating; return acc; }, { count: 0, total: 0 });
    res.json({ success: true, data: reviews, summary: { count: summary.count, average: summary.count ? Number((summary.total / summary.count).toFixed(1)) : 0 } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || !comment?.trim()) return res.status(400).json({ success: false, message: "Rating and review are required" });
    const product = await Product.findById(req.params.productId).select("_id");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const review = await Review.findOneAndUpdate(
      { product: product._id, user: req.userId },
      { rating: Number(rating), title: title || "", comment: comment.trim(), isApproved: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("user", "username profilePic");
    res.status(201).json({ success: true, data: review, message: "Review saved" });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "You have already reviewed this product" });
    res.status(500).json({ success: false, message: error.message });
  }
};
