const { Cart } = require("../models/cartModel");
const { Order } = require("../models/orderModel");
const { Product } = require("../models/productModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");

exports.createOrder = async (req, res) => {                                                    
  // create Order for single product
  try {
    const userId = req.userId; // token // logged in user's userId
    const { productId } = req.query;
    const { addressId } = req.query;
    const { quantity } = req.body;
    let productsArr = [];
    let orderValue = 0;

    if (!quantity || quantity === "") {
      return resHandler(res, 400, "Qty Feild is necessary ");
    }

       if (!productId || !addressId || !userId) {
      return resHandler(res, 400, "Some query Params are missing!");
    }



    let user = await User.findById(userId);

    const product = await Product.findById(productId);

    const orderProduct = { productId, quantity };

    productsArr.push(orderProduct);

    orderValue = quantity * product.price; // value is not calculated in the right format

    if (user.addresses && user.addresses.includes(addressId) === false) {
      return resHandler(
        res,
        400,
        "This AddressId doesnot belong to logged in user!"
      );
    }

    const order = await Order.create({
      userId,
      addressId,
      products: productsArr,
      orderValue: orderValue,
    });

    if (order) {
      user.orders.push(order._id);
      await user.save();

      resHandler(res, 200, "Order created Succesfully!", order);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.createCartorder = async (req, res) => {
  try {
    const userId = req.userId;

    const { cartId , addressId } = req.query;     


    if (!cartId || !addressId || !userId) {
      return resHandler(res, 400, "No params Found!");
    }

    let cart = await Cart.findById(cartId);
    
    let user = await User.findById(userId);

    if (!cart || cart.cartValue === 0) {
      return resHandler(res, 404, "Cart Empty!");
    }

    const products = cart.products;
    const orderValue = cart.cartValue;

    const createOrder = await Order.create({
      userId,
      addressId,
      products,
      orderValue,
    });

    if (createOrder) {
      user.orders.push(createOrder._id);
      cart.cartValue = 0
      cart.products = []
      await user.save();
      await cart.save();
      resHandler(res, 201, "Order Created", createOrder);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.updateOrderStatus = async (req, res, orderStatus) => {
  try {
    const { orderId } = req.params;

    let order = await Order.findById(orderId);

    if (!order) {
      return resHandler(res, 404, "Order not Found!");
    }

    order.orderStatus = orderStatus;

    await order.save();

    return resHandler(res, 200, `Order ${orderStatus}!` , order);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.fetchAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (orders.length > 0) {
      return resHandler(res, 200, `${orders.length} orders  Found!`, orders);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.fetchOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (order) {
      return resHandler(res, 200, `Order Found!`, order);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};