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
    stock : {
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
    /// reviews model here
    reviews : [
      {
        user : {
          type : mongoose.Schema.Types.ObjectId,
          ref : "User",
        },
        name : String,
        rating : Number,
        comment : String,
        createdAt : {
          type : Date,
          default : Date.now,
        },
      },
    ],
    /// average rating 
    averageRating : {
      type : Number,
      default : 0,
    },
    // ab total reviews
    numOfReviews : {
      type :Number,
      default : 0,
    },
  },
  { 
    timestamps : true 
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
