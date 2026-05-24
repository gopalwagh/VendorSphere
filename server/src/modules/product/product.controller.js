import Product from "./product.model.js";
import Order from "../order/order.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import { redisClient } from "../../config/redis.js";

export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, brand, stock , } = req.body;

  if(!title || !description || !price || !category) {
    throw new ApiError(400, "All required fields missing.");
  }
  // images are got undefined so check it later 
/*  console.log( req.file );  */
  if(!req.file){
    throw new ApiError(400, "product image required");
  }
  // upload images 
  const uploadImage = await uploadToCloudinary(
    req.file.buffer
  );
  // create a product
  const product = await Product.create(
    {
      title, description, price, category, brand, stock,

      images : [
        {
          url : uploadImage.secure_url,
          public_id : uploadImage.public_id,
        },
      ],

      createdBy : req.user._id,
    }
  );

  return res 
    .status(201)
    .json(
      new ApiResponse(
        201,
        product,
        "Product created successfully"
      )
    );
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const { 
    search, category, 
    page = 1, limit = 10,
    sort = "latest",
  } = req.query;
  
  // dynamic query object new
  const query = {};

  // cachekey redis
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  // search filter ka logic 
  if(search){
    query.title = {
      $regex : search,
      $options : "i",
    };
  }

  // category based filter
  if(category){
    query.category = category;
  }
  // sorting logic 
  let sortOption = {};
  if(sort === "latest"){ sortOption = { createdAt : -1 }; }
  if(sort === "priceLowToHigh"){ sortOption = { price :1 }; }
  if(sort === "priceHighToLow"){ sortOption = { price: -1 }; }

  //pagination logic
  const skip = (Number(page) -1) * Number(limit);
  // fetch products

  const cachedProducts = await redisClient.get(cacheKey);
  // redisClient.get(keyName) se keyName par jo data hai wah receive hota hi 
  if(cachedProducts){
    console.log("serving from Redis Cache");
    
    return res.status(200).json(
      new ApiResponse(
        200,
        JSON.parse(cachedProducts),
        "Products fetched from cache"
      )
    )
  }
  const products = await Product
    .find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  // total products count
  const totalProducts =
    await Product.countDocuments(query);
  
    /** -1 -> descending order mai jo new aaya wah first 
     * $options: "i"
        Case insensitive.
    */

  const responseData = {
    products,
    pagination: {
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(
        totalProducts /
        Number(limit)
      ),
    },
  };  
  // set(keyaName,data) == isse se redis mai data store hota hai
  // key : value  ke forat mai data store hota hai
  await redisClient.set(
    cachekey,
    JSON.stringify(responseData),{
      EX: 60, // 60 seconds ke baad automatically delete ho jayega
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseData,
        "Products fetched successfully"
      )
    );
});

export const getSingleProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
/** Product na mila tab us Id ka  */
  if(!product){
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        product,
        "Product fetched successfully"
      )
    );
});

// reviews  controller here write
export const addReview = asyncHandler(async(req, res) => {
  const { rating, comment, } = req.body;
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if(!product){
    throw new ApiError(404,"Product not found");
  }
  // agar purchase kiya hai tabhi review kar sakta hai nahi to nahi
  const hasPurchased = await Order.findOne({
    user : req.user._id,
    paymentStatus : "paid",
    "orderItems.product" : productId,
    /* checks nested array documents.
      Mongo automatically searches:
      inside orderItems array 
    */
  })
  if(!hasPurchased){
    throw new ApiError(403,"Only buyers can review this product");
  }
  // check already reviewd
  const alreadyReviewed = product.reviews.find((review) => {
    review.user.toString() === req.user._id.toString()
  });
  if (alreadyReviewed) {
    throw new ApiError(400, "You  already reviewed this product"
    );
  }  

  // create new reviews
  const review = {
    user : req.user._id,
    name : req.user.name,
    rating: Number(rating),
    comment,
  };
  product.reviews.push(review);
  
  /** Calculate averages reviews */
  product.numOfReviews = product.reviews.length;
  product.averageRating = product.reviews.reduce((acc, item) => 
    acc + item.rating, 0
  ) / product.reviews.length;

  await product.save();

  return res.status(200).json(
    new ApiResponse(
      201,
      product,
      "Review added successfully"
    )
  );
});

export const getProductReviews = asyncHandler(async(req,res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId)
    .populate({
      path: "reviews.user",
      select: "name avatar",
    });
  if (!product) {
    throw new ApiError(404,"Product not found");
  }
  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews: product.reviews,
        averageRating: product.averageRating,
        numOfReviews: product.numOfReviews,
      },
      "Reviews fetched successfully"
    )
  );
});