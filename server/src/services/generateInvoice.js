import PDFDocument from "pdfkit";

import fs from "fs";
import path from "path";
import doc from "pdfkit";

const generateInvoice = async({
  order,
  user,
}) => {
  /// invoice ka folder
  const invoiceDir = path.join(
    "src",
    "invoices"
  );
  if(!fs.existsSync(invoiceDir)){
    fs.mkdirSync(invoiceDir,{
      recursive : true,
    });
  }
  const filePath = path.join(
    invoiceDir,
    `invoice-${order._id}.pdf`
  );
  // create pdf 
  const pdf = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  // title
  doc
    .fontSize(22)
    .text("E-Commerce Invoice", {
      align: "center",
    });
  
  doc.moveDown();
  // customer details 
  doc
    .fontSize(14)
    .text(`Customer: ${user.name}`);

  doc.text(`Email: ${user.email}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(
    `Payment Status: ${order.paymentStatus}`
  );
  doc.moveDown();
  //products
  order.orderItems.forEach((item) => {
    doc.text(
      `${item.quantity} x ₹${item.price}`
    );
  });
  doc.moveDown();
  //total
  doc
    .fontSize(16)
    .text(
      `Total Amount: ₹${order.totalAmount}`
    );
  doc.end();
  return filePath;  
}

export default generateInvoice;