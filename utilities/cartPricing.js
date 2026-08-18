const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const { Product } = require("../models/productModel");

function effectivePrice(product) {
  const price = Number(product.price);
  const discount = Number(product.discount || 0);
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}

async function getPricedCart(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user");

  const cart = await Cart.findOne({ userId }).lean();
  if (!cart?.products?.length) throw new Error("Cart is empty");

  const quantities = new Map();
  for (const item of cart.products) {
    const id = String(item.productId);
    const quantity = Number(item.quantity);
    if (!mongoose.Types.ObjectId.isValid(id) || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Cart contains an invalid item");
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const products = await Product.find({
    _id: { $in: [...quantities.keys()] },
    isArchived: { $ne: true },
    isAvailable: true,
  })
    .select("price discount stock")
    .lean();
  const byId = new Map(products.map((product) => [String(product._id), product]));

  let total = 0;
  const orderProducts = [];
  for (const [productId, quantity] of quantities) {
    const product = byId.get(productId);
    if (!product || product.stock < quantity) throw new Error("One or more cart items are unavailable");
    total += effectivePrice(product) * quantity;
    orderProducts.push({ productId, quantity });
  }

  return { cart, products: orderProducts, total: Math.round(total * 100) / 100 };
}

module.exports = { effectivePrice, getPricedCart };
