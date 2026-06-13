import Cart from "./cart.model.js";
import Product from "../product/product.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { getPopulatedCartResponse } from "../../utils/buildCartResponse.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if(!productId){
    throw new ApiError(400, "Product ID required");
  }
  // check product Exists or not
  const product = await Product.findById(productId);
  if(!product){
    throw new ApiError(404, "Product not Found");
  }
  
  // find user cart
  let cart = await Cart.findOne({
    user : req.user._id,
  });

  // id cart doesn't exist 
  if(!cart){
    cart = await Cart.create({
      user : req.user._id,
      items : [],
    });
  }

  // check product already exits in cart or not
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );
  if(existingItem){
    existingItem.quantity += quantity || 1;
  }else{
    cart.items.push({
      product : productId,
      quantity : quantity || 1,
    });
  }

  await cart.save();

  const responseData = await getPopulatedCartResponse(cart._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Product added to Cart"
    )
  );
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate({
    path: "items.product",
    select: "title price images stock category",
  });

  if (!cart) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          cart: { items: [] },
          summary: {
            totalItems: 0,
            subtotal: 0,
          },
        },
        "Cart is Empty"
      )
    );
  }

  const responseData = await getPopulatedCartResponse(cart);

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Cart fetched successfully"
    )
  );
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  const responseData = await getPopulatedCartResponse(cart._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Product removed from cart"
    )
  );
});

export const updateCartQuantity = asyncHandler(async(req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if(!quantity || quantity < 1){
    throw new ApiError(400, "Quantity must be at least 1");
  }
  // cart find
  const cart = await Cart.findOne({
    user : req.user._id,
  });
  if(!cart){
    throw new ApiError(404,"Cart not found");
  }
  // ab cartItem find karenge
  const cartItem = cart.items.find((item) => item.product.toString() === productId);
  if(!cartItem){
    throw new ApiError(404, "Product not found in cart");
  }
  
  // ab product ka stock check karenge
  const product = await Product.findById( productId );
  if(!product){
    throw new ApiError(404, "Product not found");
  }

  if(quantity > product.stock){
    throw new ApiError(400, "Not enough stock available");
  }

  // finally update quqntity
  cartItem.quantity = quantity;
  await cart.save();

  const responseData = await getPopulatedCartResponse(cart._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Cart quantity updated"
    )
  );
});
