import Cart from "../modules/cart/cart.model.js";

export const getPopulatedCartResponse = async (cartId) => {
  const cart = await Cart.findById(cartId)
    .populate({
      path: "items.product",
      select: "title price images stock category",
    });

  return buildCartResponse(cart);
};

export const buildCartResponse = (cart) => {
  let subtotal = 0;
  let totalItems = 0;

  cart.items.forEach((item) => {
    if (!item.product) return;
    subtotal += item.product.price * item.quantity;
    totalItems += item.quantity;
  });

  return {
    cart,
    summary: {
      totalItems,
      subtotal,
    },
  };
};

