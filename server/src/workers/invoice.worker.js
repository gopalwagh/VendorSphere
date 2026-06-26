import { Worker } from "bullmq";
import fs from "fs";

import Order from "../modules/order/order.model.js";
import User from "../modules/user/user.model.js";

import generateInvoice from "../services/generateInvoice.js";
import uploadInvoiceToCloudinary from "../utils/uploadInvoiceToCloudinary.js";

import ApiError from "../utils/ApiError.js";

const invoiceWorker = new Worker("invoiceQueue",
  async(job) => {
    const { orderId, userId } = job.data;

    const [order, user] = await Promise.all([
      Order.findById(orderId),
      User.findById(userId),
    ]);

    if(!order || !user){
      throw new ApiError(403,"Order or User not found");
    }

    const invoicePath = await generateInvoice({ order, user, });

    const uploaded = await uploadInvoiceToCloudinary( invoicePath );

    const downloadUrl = uploaded.secure_url.replace(
      "/upload/",
      "/upload/fl_attachment/"
    );
    order.invoice = {
      url: downloadUrl,
      public_id: uploaded.public_id,
      generatedAt: new Date(),
    };
 
    await order.save();
    try {
      fs.unlinkSync(invoicePath);
    } catch (error) {
      console.error(
        "Invoice cleanup failed:",
        error.message
      );
    }

  },
  {
    connection :{
      url: process.env.REDIS_URL,
    },
  }
)

invoiceWorker.on(
  "completed",
  (job) => {
    console.log(
      "Invoice job completed"
    );
  }
);

invoiceWorker.on(
  "failed",
  (job, err) => {
    console.error(
      "Invoice job failed:",
      err
    );
  }
);

export default invoiceWorker;
