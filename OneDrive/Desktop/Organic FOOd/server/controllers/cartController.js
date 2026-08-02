const { Cart } = require("../models/cartModel");
const { Product } = require("../models/productModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId || !productId) {
      return resHandler(res, 400, "No params Found!");
    }

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return resHandler(res, 404, "Entities not Found!");
    }

    const arrObject = {
      productId: productId,
      quantity: quantity,
    };

    // ✅ If no cartId on user, create a new cart
    if (!user.cartId) {
      const cartValue = product.price * quantity;

      const newCart = await Cart.create({
        userId,
        products: [arrObject],
        cartValue,
      });

      user.cartId = newCart._id;
      await user.save();

      return resHandler(res, 200, "Cart Created!", newCart);
    }

    // ✅ Else, add to existing cart
    const oldCart = await Cart.findById(user.cartId);

    // ❗ Handle case where cart is not found (corrupt cartId reference)
    if (!oldCart) {
      const cartValue = product.price * quantity;

      const newCart = await Cart.create({
        userId,
        products: [arrObject],
        cartValue,
      });

      user.cartId = newCart._id;
      await user.save();

      return resHandler(res, 200, "Product added", newCart);
    }

    oldCart.products.push(arrObject);
    const incrementValue = product.price * quantity;
    oldCart.cartValue += incrementValue;

    await oldCart.save();

    return resHandler(res, 200, "Product added!", oldCart);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error");
  }
};


exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId || !productId) {
      return resHandler(res, 400, "No params Found!");
    }

    let user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return resHandler(res, 404, "Entities not Found!");
    }

    let cart = await Cart.findById(user.cartId);

    const index = cart.products.findIndex(
      (element) => element.productId.toString() === productId
    );

    if (index === -1) {
      return resHandler(res, 404, "Product not found in your cart !");
    }

    const decrementValue = product.price * cart.products[index].quantity;

    cart.products.splice(index, 1);
    cart.cartValue = cart.cartValue - decrementValue;

    if (cart.products.length === 0) {
      cart.cartValue = 0;
    }

    await cart.save();

    return resHandler(res, 200, "Product removed!", cart);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return resHandler(res, 400, "No params Found!");
    }

    let user = await User.findById(userId);
    let cart = await Cart.findById(user.cartId).populate('products.productId');

    if (cart) {
      return resHandler(res, 200, "User's Cart Found", cart);
    } else {
      return resHandler(res, 404, "Cart Empty!");
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};
