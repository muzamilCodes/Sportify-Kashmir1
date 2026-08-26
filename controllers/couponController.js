const Coupon = require("../models/couponModel");

// 1. Get All Coupons (Admin or Public listing of active promo codes)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons",
    });
  }
};

// 2. Add New Coupon (Admin)
exports.addCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
    } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Code, discount value, and expiry date are required",
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      discountType: discountType || "Percentage",
      discountValue: Number(discountValue),
      maxDiscountAmount: Number(maxDiscountAmount || 0),
      minOrderValue: Number(minOrderValue || 0),
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit || 0),
      perUserLimit: Number(perUserLimit || 1),
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    console.error("Add coupon error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

// 3. Edit / Update Coupon (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (code) coupon.code = String(code).trim().toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (startDate) coupon.startDate = new Date(startDate);
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Toggle Coupon Status (Admin)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
      data: coupon,
    });
  } catch (error) {
    console.error("Toggle coupon error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update coupon status",
    });
  }
};

// 5. Delete Coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};

// 6. Validate Coupon during Checkout (Customer)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    const userId = req.userId;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({ success: false, message: "This coupon is not active yet" });
    }

    if (coupon.expiryDate && now > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: "This coupon has expired" });
    }

    const subtotal = Number(orderAmount);
    if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    // Check usage limits
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "This coupon has reached its maximum total usage limit" });
    }

    // Check per-user usage limit if logged in
    if (userId && coupon.perUserLimit > 0) {
      const userUsage = (coupon.usedBy || []).find((u) => u.user && u.user.toString() === userId.toString());
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return res.status(400).json({
          success: false,
          message: `You have already used this coupon maximum (${coupon.perUserLimit}) allowed time(s)`,
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "Percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Number(discountAmount.toFixed(2));

    return res.status(200).json({
      success: true,
      message: `Coupon applied! You saved ₹${discountAmount}`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        finalAmount: Number((subtotal - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Generate Unique Single-Use Spin Wheel Coupon (15 Minutes Expiry)
exports.generateSpinCoupon = async (req, res) => {
  try {
    const { discountPercent } = req.body;
    const pct = Number(discountPercent);

    if (!pct || (pct !== 10 && pct !== 12 && pct !== 15 && pct !== 5)) {
      return res.status(400).json({ success: false, message: "Invalid spin discount value" });
    }

    // Generate unique random 4-character alphanumeric code e.g. SPIN10-7B3F
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `SPIN${pct}-${randSuffix}`;

    // 15-minute strict expiry
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000);

    const coupon = await Coupon.create({
      code,
      discountType: "Percentage",
      discountValue: pct,
      maxDiscountAmount: 1500, // max ₹1,500 cap
      minOrderValue: 499,
      startDate: new Date(),
      expiryDate,
      usageLimit: 1, // Only 1 use in total across the entire store
      perUserLimit: 1,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Unique single-use spin coupon generated successfully",
      data: {
        code: coupon.code,
        discountValue: coupon.discountValue,
        expiryDate: coupon.expiryDate,
        expiresInSeconds: 15 * 60,
      },
    });
  } catch (error) {
    console.error("Spin coupon generate error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate spin coupon" });
  }
};

