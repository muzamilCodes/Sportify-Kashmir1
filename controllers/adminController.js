const { Product } = require("../models/productModel");
const Order = require("../models/orderModel");
const { User } = require("../models/userModel");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$orderValue" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending"
    });
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean();
    
    // Format recent orders for frontend
    const formattedOrders = recentOrders.map(order => ({
      _id: order._id,
      orderId: order.orderId || order._id.toString().slice(-8),
      customerName: order.userId?.name || "Guest User",
      amount: order.orderValue,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    }));
    
    // Calculate growth percentages (mock for now - can be calculated from previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
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
    
    const lastMonthRevenue = await Order.aggregate([
      { $match: { 
        paymentStatus: "paid",
        createdAt: { $lt: today, $gte: lastMonth }
      }},
      { $group: { _id: null, total: { $sum: "$orderValue" } } }
    ]);
    const lastMonthRevenueTotal = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRevenueTotal > 0
      ? Math.round(((totalRevenue - lastMonthRevenueTotal) / lastMonthRevenueTotal) * 100)
      : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
          todayOrders,
          pendingOrders,
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
          paymentStatus: "paid",
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