import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title : {
      type : String,
      required : true,
      trim : true,
    },
    description : {
      type : String,
      required : true,  
    },
    price : {
      type : Number,
      required : true,
    },
    category : {
      type : String,
      required : true,
    },
    brand : {
      type : String,
    },
    Stock : { 
      type : Number,
      required : true,
      default : 0,
    },
    images : [
      {
        url : String,
        public_id : String,
      },
    ],
    createdBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User",
    },
  },
  { timestamps : true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;