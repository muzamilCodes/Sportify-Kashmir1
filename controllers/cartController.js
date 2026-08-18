const Cart = require("../models/cartModel");
const { Product } = require("../models/productModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity = 1, color, size } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return resHandler(res, 400, "Invalid params!");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return resHandler(res, 404, "Product not Found!");
    }

    // Find existing cart or create new
    let cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      cart = await Cart.create({
        userId: userId,
        products: [],
        cartValue: 0
      });
    }

    // Check if product already in cart
    const existingIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex !== -1) {
      // Update quantity
      cart.products[existingIndex].quantity += quantity;
    } else {
      // Add new product
      cart.products.push({
        productId: productId,
        quantity: quantity
      });
    }

    // Calculate cart value
    const productIds = cart.products.map((item) => item.productId);
    const cartProducts = await Product.find({ _id: { $in: productIds } }).select("price discount").lean();
    const prices = new Map(cartProducts.map((item) => [String(item._id), item.price * (1 - (item.discount || 0) / 100)]));
    cart.cartValue = Math.round(cart.products.reduce((total, item) => total + (prices.get(String(item.productId)) || 0) * item.quantity, 0) * 100) / 100;
    if (isNaN(cart.cartValue)) cart.cartValue = 0;
    
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('products.productId');
    return resHandler(res, 200, "Product added!", populatedCart);
    
  } catch (error) {
    console.error("Add to cart ERROR:", error);
    return resHandler(res, 500, "Server Error: " + error.message);
  }
};


exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    
    
    if (!userId) {
      return resHandler(res, 401, "User not authenticated!");
    }
    
    if (!productId) {
      return resHandler(res, 400, "Product ID required!");
    }
    
    // Find cart by userId
    let cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      return resHandler(res, 404, "Cart not found!");
    }
    
    
    // Find and remove product
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    
    const removed = initialLength !== cart.products.length;
    
    if (!removed) {
      return resHandler(res, 404, "Product not found in cart!");
    }
    
    
    // Recalculate cart value
    const cartProducts = await Product.find({ _id: { $in: cart.products.map((item) => item.productId) } }).select("price discount").lean();
    const prices = new Map(cartProducts.map((item) => [String(item._id), item.price * (1 - (item.discount || 0) / 100)]));
    cart.cartValue = Math.round(cart.products.reduce((total, item) => total + (prices.get(String(item.productId)) || 0) * item.quantity, 0) * 100) / 100;
    await cart.save();
    
    
    const populatedCart = await Cart.findById(cart._id).populate('products.productId');
    return resHandler(res, 200, "Product removed successfully!", populatedCart);
    
  } catch (error) {
    console.error("Remove from cart error:", error);
    return resHandler(res, 500, "Server Error: " + error.message);
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    
    if (!userId) {
      return resHandler(res, 401, "User not authenticated!");
    }
    if (!productId || quantity < 1) {
      return resHandler(res, 400, "Invalid params!");
    }
    const cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      return resHandler(res, 404, "Cart not found!");
    }
    
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    
    if (productIndex === -1) {
      return resHandler(res, 404, "Product not found in cart!");
    }
    
    // Update quantity
    cart.products[productIndex].quantity = quantity;
    
    // Recalculate cart value
    const cartProducts = await Product.find({ _id: { $in: cart.products.map((item) => item.productId) } }).select("price discount").lean();
    const prices = new Map(cartProducts.map((item) => [String(item._id), item.price * (1 - (item.discount || 0) / 100)]));
    cart.cartValue = Math.round(cart.products.reduce((total, item) => total + (prices.get(String(item.productId)) || 0) * item.quantity, 0) * 100) / 100;
    await cart.save();
    
    
    const populatedCart = await Cart.findById(cart._id).populate('products.productId');
    return resHandler(res, 200, "Quantity updated!", populatedCart);
    
  } catch (error) {
    console.error("Update quantity error:", error);
    return resHandler(res, 500, "Server Error: " + error.message);
  }
};
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return resHandler(res, 401, "Authentication required");
    }

    // ✅ Directly find cart by userId
    const cart = await Cart.findOne({ userId: userId }).populate("products.productId");
    

    if (cart && cart.products && cart.products.length > 0) {
      return resHandler(res, 200, "Cart found", cart);
    } else {
      return resHandler(res, 200, "Cart is empty", { products: [] });
    }
    
  } catch (error) {
    console.error("Get cart error:", error);
    return resHandler(res, 500, "Server error: " + error.message);
  }
};
exports.getGuestCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return resHandler(res, 400, "Cart ID required!");
    }

    let cart = await Cart.findById(cartId).populate('products.productId');

    if (cart) {
      return resHandler(res, 200, "Guest Cart Found", cart);
    } else {
      return resHandler(res, 404, "Cart not found!");
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};
