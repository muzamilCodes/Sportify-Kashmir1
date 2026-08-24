const Review = require("../models/reviewModel");
const { Product } = require("../models/productModel");
const Order = require("../models/orderModel");

// 1. List Approved Reviews for a Product (Public)
exports.list = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })
      .lean();

    const summary = reviews.reduce(
      (acc, review) => {
        acc.count += 1;
        acc.total += review.rating;
        acc.distribution[review.rating] = (acc.distribution[review.rating] || 0) + 1;
        return acc;
      },
      { count: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    );

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    return res.json({
      success: true,
      data: reviews,
      summary: {
        count: summary.count,
        average: summary.count ? Number((summary.total / summary.count).toFixed(1)) : 0,
        distribution: summary.distribution,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create or Update Review (Customer)
exports.create = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const userId = req.userId;
    const productId = req.params.productId;

    if (!rating || !comment?.trim()) {
      return res.status(400).json({ success: false, message: "Rating (1-5) and comment are required" });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5 stars" });
    }

    const product = await Product.findById(productId).select("_id name");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if user has purchased this product (Verified Purchase Check)
    let isVerifiedPurchase = false;
    let orderMatch = null;
    try {
      orderMatch = await Order.findOne({
        userId: userId,
        "products.productId": productId,
        orderStatus: { $in: ["confirmed", "shipped", "out_for_delivery", "delivered"] },
      }).select("_id");
      if (orderMatch) isVerifiedPurchase = true;
    } catch {
      // Non-blocking
    }

    const review = await Review.findOneAndUpdate(
      { product: product._id, user: userId },
      {
        rating: ratingNum,
        title: title ? String(title).trim() : "",
        comment: String(comment).trim(),
        images: Array.isArray(images) ? images : [],
        isVerifiedPurchase: isVerifiedPurchase,
        order: orderMatch?._id,
        isApproved: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("user", "username profilePic");

    return res.status(201).json({
      success: true,
      data: review,
      message: isVerifiedPurchase ? "Verified purchase review submitted successfully!" : "Review submitted successfully!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this product" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Delete Own Review (Customer)
exports.deleteMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findOneAndDelete({ _id: id, user: req.userId });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found or unauthorized" });
    }
    return res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin: List All Reviews with status & filters
exports.adminListReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const query = {};
    if (status === "approved") query.isApproved = true;
    if (status === "pending" || status === "rejected") query.isApproved = false;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate("user", "username email mobile profilePic")
      .populate("product", "name price productImgUrls")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Admin: Toggle Review Approval
exports.adminToggleApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isApproved = isApproved !== undefined ? Boolean(isApproved) : !review.isApproved;
    await review.save();

    return res.status(200).json({
      success: true,
      data: review,
      message: `Review ${review.isApproved ? "approved" : "hidden"} successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Admin: Delete Any Review
exports.adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    return res.status(200).json({ success: true, message: "Review permanently deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
