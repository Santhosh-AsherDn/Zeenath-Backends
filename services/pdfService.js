import PDFDocument from "pdfkit";

export const generateInvoice = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const {
        _id,
        name = "N/A",
        email = "N/A",
        mobilenumber = "N/A",
        roomName = "Room",
        checkInDate,
        checkOutDate,
        numberofNights = 1,
        subtotal = 0,
        gst = 0,
        gstAmount = 0,
        total = 0,
        status = "unpaid",
      } = booking;

      const formatCurrency = (amt) =>
        typeof amt === "number" ? `${amt.toFixed(2)}` : "0.00";

      const checkIn = new Date(checkInDate).toLocaleDateString("en-IN");
      const checkOut = new Date(checkOutDate).toLocaleDateString("en-IN");
      const invoiceId =
        _id && typeof _id.toString === "function"
          ? _id.toString().slice(-6).toUpperCase()
          : `TEMP-${Date.now().toString().slice(-6)}`;

      // ====== Reusable Functions ======
      const drawBox = (x, y, w, h, label, contentLines = []) => {
        doc
          .rect(x, y, w, h)
          .fillOpacity(0.1)
          .fill("#f2f2f2")
          .fillOpacity(1)
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fillColor("black")
          .text(label, x + 10, y + 5);
        doc.font("Helvetica");
        contentLines.forEach((line, idx) => {
          doc.text(line, x + 10, y + 20 + idx * 12);
        });
      };

      const drawTableHeader = (y) => {
        doc
          .rect(50, y, 510, 20)
          .fillOpacity(0.1)
          .fill("#e0e0e0")
          .fillOpacity(1)
          .stroke();

        doc
          .fillColor("black")
          .font("Helvetica-Bold")
          .text("DESCRIPTION", 55, y + 5)
          .text("NIGHTS", 310, y + 5)
          .text("RATE", 390, y + 5)
          .text("AMOUNT", 470, y + 5);
      };

      const drawSummaryRow = (label, value) => {
        doc
          .font("Helvetica")
          .text(label, 350)
          .text(formatCurrency(value), 470, doc.y - 12, { align: "right" });
      };

      // ===== Header =====
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Zeenath Taj Garden", { align: "center" });
      doc.fontSize(14).text("HOTEL INVOICE", { align: "center" }).moveDown();

      // ===== From & To Boxes =====
      const topY = doc.y;
      drawBox(50, topY, 240, 80, "FROM", [
        "Zeenath Taj Garden (Residential)",
        "Main Street, Yelagiri Hills",
        "Tamil Nadu, India",
        "+91 98765 43210",
      ]);

      drawBox(320, topY, 240, 80, "BILL TO", [name, email, mobilenumber]);
      doc.moveDown(4);

      // ===== Booking Info =====
      const boxY = doc.y;
      drawBox(50, boxY, 510, 60, "DETAILS", [
        `DATE: ${checkOut}`,
        `INVOICE NO: ${invoiceId}`,
        `CHECK-IN: ${checkIn}`,
        `CHECK-OUT: ${checkOut}`,
      ]);
      doc.moveDown(3);

      // ===== Table =====
      const tableY = doc.y;
      drawTableHeader(tableY);

      const rowY = tableY + 25;
      const ratePerNight = subtotal / numberofNights;
      doc
        .font("Helvetica")
        .text(`1. ${roomName}`, 55, rowY)
        .text(`${numberofNights}`, 310, rowY)
        .text(formatCurrency(ratePerNight), 390, rowY)
        .text(formatCurrency(subtotal), 470, rowY);

      doc.moveDown(4);

      // ===== Summary =====
      drawSummaryRow("SUBTOTAL", subtotal);
      drawSummaryRow(`GST (${gst}%)`, gstAmount);
      doc.font("Helvetica-Bold");
      drawSummaryRow("TOTAL", total);
      doc.moveDown(2);

      // ===== Notes =====
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text(`NOTES / ADD-ONS: ${formatCurrency(total)} Rupees Only`);

      // ===== Paid Stamp =====
      if (status === "paid") {
        doc
          .fontSize(40)
          .fillColor("#bfbfbf")
          .rotate(-20, { origin: [300, 400] })
          .opacity(0.3)
          .text("PAID", 220, 300)
          .rotate(20)
          .opacity(1)
          .fillColor("black");
      }

      // ===== Footer =====
      doc
        .font("Helvetica")
        .fontSize(10)
        .text("Thank You For Your Stay", 50, 780, { align: "left" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
