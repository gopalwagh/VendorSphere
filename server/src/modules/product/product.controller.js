import Product from "./product.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

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
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            products,
            pagination : {
              totalProducts,
              currentPage : Number(page),
              totalPages: Math.ceil(
                  totalProducts / Number(limit)
                ),
            },
          },
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
