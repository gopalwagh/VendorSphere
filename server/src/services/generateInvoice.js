import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode"; 
import os from "os";

const generateInvoice = async ({ order, user }) => {
  const invoiceNumber =
  `INV-${new Date().getFullYear()}-${order._id
    .toString()
    .slice(-6)
    .toUpperCase()}`;

  const filePath = path.join(os.tmpdir(), `${invoiceNumber}.pdf`);

  const pdf = new PDFDocument({ margin: 50 }); 
  const stream = fs.createWriteStream(filePath);

  pdf.pipe(stream);

  // --- BRAND COLORS & CONFIG ---
  const PRIMARY_COLOR = "#0f172a";   
  const SECONDARY_COLOR = "#0ea5e9"; 
  const TEXT_MAIN = "#1e293b";      
  const TEXT_MUTED = "#64748b";     
  const BG_LIGHT = "#f8fafc";       

  const baseUrl = process.env.CLIENT_URL || "https://vendorsphere.com";
  const trackingUrl = `${baseUrl}/orders/${order._id}`;

  // 🔥 FIX FOR PRODUCTION: Generate QR Code directly as a Memory Buffer!
  // Isse disk par koi file nahi banegi, crash hone ka chance 0%
  const qrBuffer = await QRCode.toBuffer(trackingUrl, {
    color: { dark: "#0f172a", light: "#ffffff" },
    width: 90,
    margin: 1
  });

  // HEADER SECTION 
  pdf.fillColor(PRIMARY_COLOR).fontSize(24).text("VendorSphere", 50, 50, { bold: true });
  pdf.fontSize(10).fillColor(SECONDARY_COLOR).text("Your Global B2B Marketplace", 50, 78);
  pdf.fontSize(18).fillColor(PRIMARY_COLOR).text("INVOICE", 400, 50, { align: "right" });

  pdf.moveDown(2);
  pdf.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, 105).lineTo(550, 105).stroke();

  // METADATA SECTION 
  let metaY = 125;
  
  pdf.fontSize(10).fillColor(TEXT_MUTED).text("BILLED TO:", 50, metaY);
  pdf.fontSize(11).fillColor(TEXT_MAIN).text(user.name, 50, metaY + 15, { bold: true });
  pdf.fontSize(9).fillColor(TEXT_MUTED).text(user.email, 50, metaY + 30);

  const addr = order.shippingAddress;
  pdf.fontSize(10).fillColor(TEXT_MUTED).text("SHIPPED TO:", 220, metaY);
  pdf.fontSize(9).fillColor(TEXT_MUTED).text(
    `${addr.addressLine1}, ${addr.city}, ${addr.state} - ${addr.pincode}\nPhone: ${addr.phone}`,
    220,
    metaY + 15,
    { width: 160 }
  );

  pdf.fontSize(10).fillColor(TEXT_MUTED).text("INVOICE DETAILS:", 400, metaY);
  pdf.fontSize(9).fillColor(TEXT_MAIN);
  pdf.text(`Invoice No: ${invoiceNumber}`, 400, metaY + 15);
  pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, metaY + 28 );
  pdf.text(`Status: `, 400, metaY + 41, { continued: true }).text(order.paymentStatus.toUpperCase(), { bold: true });

  // ITEMS TABLE SECTION
  let tableY = 220; 
  pdf.rect(50, tableY, 500, 25).fill(BG_LIGHT);

  pdf.fillColor(PRIMARY_COLOR).fontSize(10).text("Item Details / Quantity", 60, tableY + 8, { bold: true });
  pdf.text("Price", 350, tableY + 8, { width: 80, align: "right", bold: true });
  pdf.text("Total", 460, tableY + 8, { width: 80, align: "right", bold: true });

  pdf.fillColor(TEXT_MAIN);
  tableY += 30;
 
  order.orderItems.forEach((item) => {
    if (tableY > 650) {
      pdf.addPage();
      tableY = 60;
      // Header dubara draw karo
      pdf.rect(50, tableY, 500, 25).fill(BG_LIGHT);

      pdf.fillColor(PRIMARY_COLOR)
        .fontSize(10)
        .text("Item Details / Quantity", 60, tableY + 8);

      pdf.text("Price", 350, tableY + 8, {
        width: 80,
        align: "right",
      });

      pdf.text("Total", 460, tableY + 8, {
        width: 80,
        align: "right",
      });

      tableY += 30;
    }
    const itemTitle = `${item.productTitle}  (x${item.quantity})`; 
    const itemPrice = `Rs. ${item.price}`;
    const itemTotal = `Rs. ${(item.price * item.quantity)}`;

    pdf.fontSize(10).text(itemTitle, 60, tableY, { width: 270 });
    pdf.text(itemPrice, 350, tableY, { width: 80, align: "right" });
    pdf.text(itemTotal, 460, tableY, { width: 80, align: "right" });

    tableY += 25;
    pdf.strokeColor("#f1f5f9").lineWidth(0.5).moveTo(50, tableY).lineTo(550, tableY).stroke();
    tableY += 8;
  });

  // BOTTOM SECTION (QR Image from Buffer)
  let bottomY = tableY + 10;

  // 💡 Direct buffer pass kar rahe hain image function me
  if (qrBuffer) {
    pdf.image(qrBuffer, 50, bottomY, { width: 85 });
    pdf.fontSize(8).fillColor(TEXT_MUTED).text("Scan code to track live order status", 50, bottomY + 90, { width: 100, align: "center" });
  }

  const summaryX = 350;
  pdf.fontSize(10).fillColor(TEXT_MUTED);
  pdf.text("Subtotal:", summaryX, bottomY).text(`Rs. ${order.subtotal}`, 460, bottomY, { align: "right" });
  pdf.text("Tax (GST):", summaryX, bottomY + 18).text(`Rs. ${order.tax}`, 460, bottomY + 18, { align: "right" });
  pdf.text("Shipping Charge:", summaryX, bottomY + 36).text(`Rs. ${order.shipping}`, 460, bottomY + 36, { align: "right" });
  pdf.text("Discount:", summaryX, bottomY + 54).text(`Rs. ${order.discountAmount || 0}`, 460, bottomY + 54, { align: "right" });

  pdf.rect(330, bottomY + 85, 220, 35).fill(PRIMARY_COLOR);
  pdf.fillColor("#ffffff").fontSize(11).text("Grand Total:", 340, bottomY + 97, { bold: true });
  pdf.fontSize(12).text(`Rs. ${order.totalAmount}`, 450, bottomY + 97, { width: 90, align: "right", bold: true });

  // FOOTER SECTION
  const footerY = 660;
  pdf.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(50, footerY).lineTo(550, footerY).stroke();

  pdf.fillColor(TEXT_MAIN).fontSize(10).text("Thank you for shopping with VendorSphere!", 50, footerY + 15, { align: "center", bold: true });
  pdf.fontSize(9).fillColor(TEXT_MUTED).text("Need Help?", 50, footerY + 35, { align: "center", bold: true });
  pdf.text("support@vendorsphere.com   |   +91 98605 87722", 50, footerY + 48, { align: "center" });
  pdf.fontSize(8).fillColor(TEXT_MUTED).text("This is a computer-generated invoice. No signature required.", 50, footerY + 75, { align: "center", italic: true });

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve); // No file to delete here, clean exit!
    stream.on("error", reject);
    pdf.end();
  });

  return filePath;
};

export default generateInvoice;