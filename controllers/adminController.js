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
const revenueMatch = (extra = {}) => ({ orderStatus: { $in: REVENUE_STATUSES }, ...extra });

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
    
    // Calculate growth percentages
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonth = previousMonthStart;
    
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $lt: today, $gte: lastMonth }
    });
    const productsGrowth = lastMonthProducts > 0 
      ? Math.round(((totalProducts - lastMonthProducts) / lastMonthProducts) * 100)
      : 0;
    
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $lt: today, $gte: lastMonth }
    });
    const ordersGrowth = lastMonthOrders > 0
      ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 0;
    
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $lt: today, $gte: lastMonth }
    });
    const usersGrowth = lastMonthUsers > 0
      ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0;
    
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
    const soldMap = new Map(soldByProduct.map((item) => [item._id.toString(), item.soldQuantity || 0]));
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
      maintenanceMode
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
    if (freeShippingThreshold !== undefined) setting.freeShippingThreshold = freeShippingThreshold;
    if (maintenanceMode !== undefined) setting.maintenanceMode = maintenanceMode;

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
