import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateInvoice = async ({
  order,
  user,
}) => {
  const invoiceDir = path.resolve(
    "src",
    "invoices"
  );

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, {
      recursive: true,
    });
  }

  const filePath = path.join(
    invoiceDir,
    `invoice-${order._id}.pdf`
  );

  const pdf = new PDFDocument();
  const stream = fs.createWriteStream(filePath);

  pdf.pipe(stream);

  pdf
    .fontSize(22)
    .text("E-Commerce Invoice", {
      align: "center",
    });

  pdf.moveDown();

  pdf
    .fontSize(14)
    .text(`Customer: ${user.name}`);

  pdf.text(`Email: ${user.email}`);
  pdf.text(`Order ID: ${order._id}`);
  pdf.text(
    `Payment Status: ${order.paymentStatus}`
  );
  pdf.moveDown();

  order.orderItems.forEach((item) => {
    pdf.text(
      `${item.quantity} x Rs. ${item.price}`
    );
  });

  pdf.moveDown();

  pdf
    .fontSize(16)
    .text(
      `Total Amount: Rs. ${order.totalAmount}`
    );

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
    pdf.end();
  });

  return filePath;
};

export default generateInvoice;
