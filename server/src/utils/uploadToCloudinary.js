import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder : "mern_ecommerce_products",
        },
        (error, result) => {
          if(error){ reject(error); } else {  resolve(result);  }
        }
      )
      .end(fileBuffer);
  });
};

export default uploadToCloudinary;