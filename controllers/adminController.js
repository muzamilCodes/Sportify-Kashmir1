const { Product } = require("../models/productModel");
const Order = require("../models/orderModel");
const { User } = require("../models/userModel");
const { Category } = require("../models/categoryModel");
const Setting = require("../models/settingModel");

function buildStatusCountQuery(statuses) {
  return Array.isArray(statuses) ? { $in: statuses } : statuses;
}

// Revenue is based on completed/confirmed sales, regardless of whether the
// customer paid online or by COD. Pending and cancelled orders are excluded.
const REVENUE_STATUSES = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
const revenueMatch = (extra = {}) => ({
  orderStatus: { $ne: "cancelled" },
  $or: [
    { orderStatus: { $in: REVENUE_STATUSES } },
    { paymentStatus: "paid" }
  ],
  ...extra
});

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total revenue from real, non-cancelled sales.
    const revenueResult = await Order.aggregate([
      { $match: revenueMatch() },
      { $group: { _id: null, total: { $sum: "$orderValue" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get today's orders & revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          ...revenueMatch(),
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: "$orderValue" } } }
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending"
    });

    const confirmedOrders = await Order.countDocuments({
      orderStatus: buildStatusCountQuery(["confirmed", "processing"])
    });

    const shippedOrders = await Order.countDocuments({
      orderStatus: "shipped"
    });

    const outForDeliveryOrders = await Order.countDocuments({
      orderStatus: "out_for_delivery"
    });

    const deliveredOrders = await Order.countDocuments({
      orderStatus: "delivered"
    });

    const cancelledOrders = await Order.countDocuments({
      orderStatus: "cancelled"
    });
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "username name email")
      .lean();
    
    // Format recent orders for frontend
    const formattedOrders = recentOrders.map(order => ({
      _id: order._id,
      orderId: order.orderId || order._id.toString().slice(-8),
      customerName: order.userId?.username || order.userId?.name || "Guest User",
      amount: order.orderValue,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    }));
    
    // Calculate growth percentages (Current Month vs Previous Month)
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const currentMonthProducts = await Product.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: tomorrow }
    });
    const previousMonthProducts = await Product.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart }
    });
    const productsGrowth = previousMonthProducts > 0 
      ? Math.round(((currentMonthProducts - previousMonthProducts) / previousMonthProducts) * 100)
      : currentMonthProducts > 0 ? 100 : 0;
    
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: tomorrow }
    });
    const previousMonthOrders = await Order.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart }
    });
    const ordersGrowth = previousMonthOrders > 0
      ? Math.round(((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100)
      : currentMonthOrders > 0 ? 100 : 0;
    
    const currentMonthUsers = await User.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: tomorrow }
    });
    const previousMonthUsers = await User.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart }
    });
    const usersGrowth = previousMonthUsers > 0
      ? Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100)
      : currentMonthUsers > 0 ? 100 : 0;
    
    const currentMonthRevenue = await Order.aggregate([
      { $match: revenueMatch({ createdAt: { $gte: currentMonthStart, $lt: tomorrow } }) },
      { $group: { _id: null, total: { $sum: "$orderValue" } } }
    ]);
    const previousMonthRevenue = await Order.aggregate([
      { $match: revenueMatch({ createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } }) },
      { $group: { _id: null, total: { $sum: "$orderValue" } } }
    ]);
    const currentMonthRevenueTotal = currentMonthRevenue[0]?.total || 0;
    const previousMonthRevenueTotal = previousMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousMonthRevenueTotal > 0
      ? Math.round(((currentMonthRevenueTotal - previousMonthRevenueTotal) / previousMonthRevenueTotal) * 100)
      : currentMonthRevenueTotal > 0 ? 100 : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
          todayOrders,
          todayRevenue,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          outForDeliveryOrders,
          deliveredOrders,
          cancelledOrders,
          productsGrowth,
          ordersGrowth,
          usersGrowth,
          revenueGrowth
        },
        recentOrders: formattedOrders
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get chart data for revenue over time
exports.getRevenueChart = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysInt = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);
    
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...revenueMatch(),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$orderValue" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error("Revenue chart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Inventory management data
exports.getInventoryData = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ stock: 1 })
      .lean();

    const stockSumResult = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: "$stock" } } }
    ]);
    const totalItemsInStock = stockSumResult[0]?.totalStock || 0;

    const lowStockThreshold = 10;
    const soldByProduct = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      { $group: { _id: "$products.productId", soldQuantity: { $sum: "$products.quantity" } } },
    ]);
    const soldMap = new Map(
      soldByProduct
        .filter((item) => item && item._id != null)
        .map((item) => [item._id.toString(), item.soldQuantity || 0])
    );
    const inventoryProducts = products.map((product) => ({
      ...product,
      availableQuantity: product.stock || 0,
      soldQuantity: soldMap.get(product._id.toString()) || 0,
      isLowStock: (product.stock || 0) > 0 && (product.stock || 0) <= lowStockThreshold,
      isOutOfStock: (product.stock || 0) === 0,
    }));
    const lowStockItems = inventoryProducts.filter(p => p.isLowStock);
    const lowStockAlerts = lowStockItems.length;

    const categoryIdsWithStock = await Product.distinct("category", { stock: { $gt: 0 } });
    const inStockCategories = categoryIdsWithStock.length;

    return res.status(200).json({
      success: true,
      data: {
        totalItemsInStock,
        lowStockAlerts,
        inStockCategories,
        products: inventoryProducts,
        lowStockItems
      }
    });
  } catch (error) {
    console.error("Inventory data error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update stock quantity for a product
exports.updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid stock quantity required",
      });
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      { stock: Number(stock) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update stock error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Analytics & Reports data
exports.getReportsData = async (req, res) => {
  try {
    // Total sales & order count
    const salesResult = await Order.aggregate([
      { $match: revenueMatch() },
      { $group: { _id: null, total: { $sum: "$orderValue" }, count: { $sum: 1 } } }
    ]);
    const totalSales = salesResult[0]?.total || 0;
    const paidOrdersCount = salesResult[0]?.count || 0;

    // Customer metrics
    const totalCustomers = await User.countDocuments({ isAdmin: false });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await User.countDocuments({
      isAdmin: false,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const conversionRate = totalCustomers > 0 
      ? Math.round((paidOrdersCount / totalCustomers) * 100 * 10) / 10
      : 0;

    // Category breakdown
    const categorySales = await Order.aggregate([
      { $match: revenueMatch() },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$categoryDetails.name",
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
          itemsSold: { $sum: "$orderItems.quantity" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: revenueMatch() },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          name: { $first: "$orderItems.name" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
          quantitySold: { $sum: "$orderItems.quantity" }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalSales,
        newCustomers,
        totalCustomers,
        conversionRate,
        categorySales: categorySales.map(c => ({
          category: c._id || "Uncategorized",
          revenue: c.totalRevenue,
          itemsSold: c.itemsSold
        })),
        topProducts
      }
    });
  } catch (error) {
    console.error("Reports error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Store Settings
exports.getStoreSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    return res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Store Settings
exports.updateStoreSettings = async (req, res) => {
  try {
    const {
      siteName,
      siteEmail,
      sitePhone,
      siteAddress,
      currency,
      timezone,
      freeShippingThreshold,
      maintenanceMode,
      logoUrl,
      bannerUrl,
      faviconUrl,
      announcementText,
    } = req.body;

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    if (siteName !== undefined) setting.siteName = siteName;
    if (siteEmail !== undefined) setting.siteEmail = siteEmail;
    if (sitePhone !== undefined) setting.sitePhone = sitePhone;
    if (siteAddress !== undefined) setting.siteAddress = siteAddress;
    if (currency !== undefined) setting.currency = currency;
    if (timezone !== undefined) setting.timezone = timezone;
    if (freeShippingThreshold !== undefined) setting.freeShippingThreshold = Number(freeShippingThreshold);
    if (maintenanceMode !== undefined) setting.maintenanceMode = maintenanceMode === "true" || maintenanceMode === true;
    if (announcementText !== undefined) setting.announcementText = announcementText;
    if (logoUrl !== undefined) setting.logoUrl = logoUrl;
    if (bannerUrl !== undefined) setting.bannerUrl = bannerUrl;
    if (faviconUrl !== undefined) setting.faviconUrl = faviconUrl;

    // Check if multipart files were uploaded
    if (req.files) {
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of filesArray) {
        const fileUrl = file.filename
          ? `/uploads/${file.filename}`
          : `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        if (file.fieldname === "logo" || file.fieldname === "logoUrl") {
          setting.logoUrl = fileUrl;
        } else if (file.fieldname === "banner" || file.fieldname === "bannerUrl") {
          setting.bannerUrl = fileUrl;
        } else if (file.fieldname === "favicon" || file.fieldname === "faviconUrl") {
          setting.faviconUrl = fileUrl;
        }
      }
    }

    await setting.save();

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===================== GET INVENTORY HISTORY =====================
exports.getInventoryHistory = async (req, res) => {
  try {
    const InventoryHistory = require("../models/inventoryHistoryModel");
    const { page = 1, limit = 50, productId } = req.query;
    const query = {};
    if (productId) query.product = productId;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await InventoryHistory.countDocuments(query);
    const history = await InventoryHistory.find(query)
      .populate("product", "name productImgUrls stock")
      .populate("performedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getInventoryHistory error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== EXPORT SALES CSV =====================
exports.exportSalesCSV = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const orders = await Order.find({ createdAt: { $gte: startDate } })
      .populate("userId", "username email mobile")
      .populate("shippingAddress")
      .populate("products.productId", "name price sku")
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV String
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Email",
      "Mobile",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Total Amount (INR)",
      "Products Count",
    ];

    const rows = orders.map((o) => {
      const orderId = o.orderId || o._id.toString().slice(-8);
      const date = new Date(o.createdAt).toISOString().split("T")[0];
      const customer = o.shippingAddress?.firstName
        ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ""}`.trim()
        : o.guestAddress?.fullName || o.userId?.username || "Customer";
      const email = o.shippingAddress?.email || o.guestAddress?.email || o.userId?.email || "";
      const mobile = o.shippingAddress?.mobile || o.guestAddress?.mobileNumber || o.userId?.mobile || "";
      const paymentMethod = o.paymentMethod || "COD";
      const paymentStatus = o.paymentStatus || "PENDING";
      const orderStatus = o.orderStatus || "PENDING";
      const total = o.orderValue || 0;
      const count = (o.products || []).reduce((acc, p) => acc + (p.quantity || 1), 0);

      return [
        `"${orderId}"`,
        `"${date}"`,
        `"${customer.replace(/"/g, '""')}"`,
        `"${email}"`,
        `"${mobile}"`,
        `"${paymentMethod.toUpperCase()}"`,
        `"${paymentStatus.toUpperCase()}"`,
        `"${orderStatus.toUpperCase()}"`,
        total,
        count,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=sportify_sales_report_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("exportSalesCSV error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

