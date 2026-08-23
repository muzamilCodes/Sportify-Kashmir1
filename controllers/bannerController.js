const Banner = require("../models/bannerModel");

// Get public active banners for homepage
exports.getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Get public banners error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all banners for admin
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Get admin banners error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const { title, titleHighlight, subtitle, badge, buttonText, link, order, isActive } = req.body;

    let image = req.body.image || "";
    if (req.file) {
      image = req.file.filename
        ? `/uploads/${req.file.filename}`
        : `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    } else if (req.files) {
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      if (filesArray.length > 0) {
        const file = filesArray[0];
        image = file.filename
          ? `/uploads/${file.filename}`
          : `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      }
    }

    if (!image) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const banner = await Banner.create({
      image,
      title: title || "",
      titleHighlight: titleHighlight || "",
      subtitle: subtitle || "",
      badge: badge || "",
      buttonText: buttonText || "Shop Now",
      link: link || "/products",
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create banner error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, titleHighlight, subtitle, badge, buttonText, link, order, isActive, image: existingImage } = req.body;

    let image = existingImage;
    if (req.file) {
      image = req.file.filename
        ? `/uploads/${req.file.filename}`
        : `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    } else if (req.files) {
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      if (filesArray.length > 0) {
        const file = filesArray[0];
        image = file.filename
          ? `/uploads/${file.filename}`
          : `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      }
    }

    const updateData = {};
    if (image !== undefined) updateData.image = image;
    if (title !== undefined) updateData.title = title;
    if (titleHighlight !== undefined) updateData.titleHighlight = titleHighlight;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (badge !== undefined) updateData.badge = badge;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (link !== undefined) updateData.link = link;
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = isActive === "true" || isActive === true;

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
