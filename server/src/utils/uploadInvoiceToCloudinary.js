import cloudinary from "../config/cloudinary.js";

const uploadInvoiceToCloudinary = async(filePath) => {
  return cloudinary.uploader.upload(
    filePath,
    {
      folder: "vendorsphere/invoices",
      resource_type: "raw",
    }
  );
};

export default uploadInvoiceToCloudinary;