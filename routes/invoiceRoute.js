import express from "express";
import multer from "multer";
import { sendInvoiceEmail } from "../services/emailService.js";

const router = express.Router();

// Multer config for handling multipart/form-data (in-memory buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/send-invoice
router.post("/send-invoice", upload.single("invoice"), async (req, res) => {
  try {
    // Parse booking and extract invoice file buffer
    const booking = JSON.parse(req.body.booking);
    const pdfBuffer = req.file?.buffer;

    if (!booking || !pdfBuffer) {
      return res
        .status(400)
        .json({ message: "Booking data or invoice file missing" });
    }

    // Use your existing utility to send the email
    await sendInvoiceEmail(booking, pdfBuffer);

    res.status(200).json({ message: "Invoice sent successfully via email" });
  } catch (error) {
    console.error("Error in /send-invoice:", error);
    res
      .status(500)
      .json({ message: "Failed to send invoice", error: error.message });
  }
});

export default router;
