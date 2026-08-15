const { Product } = require("../models/productModel");

function quantitiesByProduct(products = []) {
  const quantities = new Map();
  for (const item of products) {
    const productId = item?.productId?._id || item?.productId;
    const quantity = Number(item?.quantity || 0);
    if (productId && Number.isInteger(quantity) && quantity > 0) {
      const key = productId.toString();
      quantities.set(key, (quantities.get(key) || 0) + quantity);
    }
  }
  return quantities;
}

async function reserveInventory(products) {
  const quantities = quantitiesByProduct(products);
  const reserved = [];
  try {
    for (const [productId, quantity] of quantities) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!product) throw new Error(`Insufficient stock for product ${productId}`);
      reserved.push({ productId, quantity });
    }
    return reserved;
  } catch (error) {
    for (const item of reserved) {
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    }
    throw error;
  }
}

async function createOrderWithInventory(Order, orderData) {
  const order = await Order.create(orderData);
  try {
    await reserveInventory(order.products);
    order.inventoryReserved = true;
    await order.save();
    return order;
  } catch (error) {
    await Order.deleteOne({ _id: order._id });
    throw error;
  }
}

async function releaseOrderInventory(order) {
  if (!order?.inventoryReserved || order.inventoryReleased) return false;
  const quantities = quantitiesByProduct(order.products);
  for (const [productId, quantity] of quantities) {
    await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } });
  }
  order.inventoryReleased = true;
  await order.save();
  return true;
}

module.exports = { quantitiesByProduct, reserveInventory, createOrderWithInventory, releaseOrderInventory };
