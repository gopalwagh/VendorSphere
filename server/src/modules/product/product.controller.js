// import excel
import xlsx from "xlsx";

import Product from "./product.model.js";
import Order from "../order/order.model.js";
import Cart from "../cart/cart.model.js";

import cloudinary from "../../config/cloudinary.js";
import { redisClient } from "../../config/redis.js";

import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { 
  getCachedData, 
  setCachedData, 
  invalidateProductCache 
} from "../../utils/redisHelper.js";
// productQueue 
import productQueue from "../../queues/product.queue.js";

export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, brand, stock , } = req.body;

  if(!title || !description || !price || !category) {
    throw new ApiError(400, "All required fields missing.");
  }
  // images file check  
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
  // cached clean around product*
  await invalidateProductCache();

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

// controller for adding bulk products through excel 
export const importProductFromExcel = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an Excel file");
  
  // File parse 
  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (!rawData || rawData.length === 0) {
    throw new ApiError(400, "Excel file is empty");
  }

  // Data Clean, Filter and Format (Excel columns mapping + Production Guard)
  const productsToInsert = rawData
    // Safeguard: Excel ki un rows ko filter out karo jisme main title hi missing ho (empty rows fix)
    .filter((item) => item.title && item.title.toString().trim() !== "")
    .map((item) => ({
      title: item.title.toString().trim(),
      description: item.description ? item.description.toString().trim() : "",
      //  Typecast: Excel se string aaye toh bhi number ban jaye
      price: Number(item.price) || 0,    
      category: item.category ? item.category.toString().trim() : "",
      brand: item.brand ? item.brand.toString().trim() : "",
         //Typecast: Ensure it is a valid integer/number
      stock: Number(item.stock) || 0,    
      createdBy: req.user._id,
    }));

  // Agar saare valid items filter ho gaye aur kuch nahi bacha
  if (productsToInsert.length === 0) {
    throw new ApiError(400, "No valid product rows found in the Excel file");
  }

  //  Push job to BullMQ
  await productQueue.add(
    "bulkImportJob",
    {
      sellerId: req.user._id,
      products: productsToInsert
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
    }
  );

  // Response send to seller without waiting
  return res.status(202).json(
    new ApiResponse(
      202,
      null,
      "File uploaded successfully!\nProducts are being added in the background."
    )
  );
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { title, description, price, category, brand, stock } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (stock !== undefined) product.stock = stock;
  // delete only first image because we only take 1 image for single product
  if (req.file) {
    if (product.images?.[0]?.public_id) {
      try {
        await cloudinary.uploader.destroy(product.images[0].public_id);
      } catch (error) {
        console.error("Failed to remove old product image:", error.message);
      }
    }
    // upload Image at cloudinary
    const uploadImage = await uploadToCloudinary(req.file.buffer);
    product.images = [
      {
        url: uploadImage.secure_url,
        public_id: uploadImage.public_id,
      },
    ];
  }
  // update product save
  await product.save();
  // redis clean around productId 
  await invalidateProductCache(productId);

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Product updated successfully"
    )
  );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.images?.length) {
    for (const image of product.images) {
      if (!image.public_id) continue;

      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        console.error("Failed to remove product image:", error.message);
      }
    }
  }

  await Product.findByIdAndDelete(productId);
  // overall users cart update
  await Cart.updateMany(
    {},
    {
      $pull: {
        items: {
          product: productId,
        },
      },
    }
  );
  // redis clean around productId
  await invalidateProductCache(productId);

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Product deleted successfully"
    )
  );
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const { 
    search, category, 
    page = 1, limit = 10,
    sort = "latest",
  } = req.query;
  
  // cachekey redis
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  //redis cached Product fetched
  const cachedProducts = await getCachedData(cacheKey);

  if(cachedProducts){
    // serving from redis
    return res.status(200).json(
      new ApiResponse(
        200,
        cachedProducts,
        "Products fetched from cache"
      )
    )
  }

  // dynamic query object new
  const query = {};
  // search filter ka logic 
  if(search){
    query.title = {
      $regex : search,  $options : "i",
    };
  }
  // category based filter
  if(category){
    query.category = new RegExp(category, "i");;
  }
  // sorting logic 
  let sortOption = {};
  if(sort === "latest") sortOption = { createdAt : -1 }; 
  if(sort === "priceLowToHigh") sortOption = { price :1 };
  if(sort === "priceHighToLow") sortOption = { price:-1 }; 

  //pagination logic
  const skip = (Number(page) -1) * Number(limit);
  // fetch products from DB
  const products = await Product
    .find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  // total products count
  const totalProducts = await Product.countDocuments(query);

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
  // new redisCached set 
  await setCachedData(cacheKey, responseData, 300);

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Products fetched successfully"
    )
  );
});

export const getSingleProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  //1 we can make unique cache key
  const cacheKey = `product:${productId}`;
  //2 ab redis se check karenge
  const cachedProduct = await getCachedData(cacheKey);

  if(cachedProduct){
    return res.status(200).json(
      new ApiResponse(
        200, 
        cachedProduct,
        "Product fetched from cache"
      )
    )
  }
  // data fetched from DB
  const product = await Product.findById(productId);

  if(!product){
    throw new ApiError(404, "Product not found");
  }
  // store in redis
  await setCachedData(cacheKey, product, 900);

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Product fetched successfully"
    )
  );
});

export const addReview = asyncHandler(async(req, res) => {
  const { rating, comment, } = req.body;
  const { productId } = req.params;
  // product fetched
  const product = await Product.findById(productId);

  if(!product){
    throw new ApiError(404,"Product not found");
  }
  // check user purched or not
  const hasPurchased = await Order.findOne({
    user : req.user._id,
    paymentStatus : "paid",
    "orderItems.product" : productId,
  });

  if(!hasPurchased){
    throw new ApiError(403,"Only buyers can review this product");
  }
  // already reviewed or not
  const alreadyReviewed = product.reviews.find(
    (review) =>
      review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw new ApiError(400, "You  already reviewed this product"
    );
  }  

  const review = {
    user : req.user._id,
    name : req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  
  product.numOfReviews = product.reviews.length;
  product.averageRating = product.reviews.reduce((acc, item) => 
    acc + item.rating, 0
  ) / product.reviews.length;

  await product.save();
  // redis cache clean around product
  await invalidateProductCache(productId);

  return res.status(201).json(
    new ApiResponse(
      201,
      product,
      "Review added successfully"
    )
  );
});

export const getProductReviews = asyncHandler(async(req,res) => {
  const { productId } = req.params;
  // pehle cacheKey banayenge
  const cacheKey = `reviews:${productId}`;
  // ab redis check
  const cachedReviews = await getCachedData(cacheKey);

  if(cachedReviews){
    return res.status(200).json(
      new ApiResponse(
        200, 
        cachedReviews, 
        "Reviews fetched from cache"
      )
    );
  }

  const product = await Product.findById(productId)
    .populate({
      path: "reviews.user",
      select: "name avatar",
    });

  if (!product) {
    throw new ApiError(404,"Product not found");
  }
  
  const responseData = {
    reviews: product.reviews,
    averageRating: product.averageRating,
    numOfReviews: product.numOfReviews,
  };
  // set Data  in cached
  await setCachedData(cacheKey, responseData, 1800);

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Reviews fetched successfully"
    )
  );
});

export const getSellerProducts = asyncHandler(async (req,res) => {
  const products = await Product.find({
    createdBy: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      products,
      "Seller products fetched successfully"
    )
  )
})
