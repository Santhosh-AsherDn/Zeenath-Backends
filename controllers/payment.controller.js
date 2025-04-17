import crypto from "crypto";
import Booking from "../models/Booking.js";
import { razorpayInstance } from "../config/razorpay.js";
// import { generateInvoice } from "../services/pdfService.js";
import { sendInvoiceEmail } from "../services/emailService.js";

export const createOrder = async (req, res) => {
  try {
    console.log("Request body received:", req.body);

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "mobilenumber",
      "roomId",
      "roomName",
      "checkInDate",
      "checkOutDate",
      "numberofNights",
      "NoofRoom",
      "total",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        receivedData: req.body,
      });
    }

    // Validate numeric fields
    const numericFields = [
      "total",
      "subtotal",
      "gstPercentage",
      "numberofNights",
      "NoofRoom",
    ];
    const invalidNumericFields = numericFields.filter((field) => {
      const value = Number(req.body[field]);
      return isNaN(value) || value < 0;
    });

    if (invalidNumericFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid numeric values for: ${invalidNumericFields.join(
          ", "
        )}`,
      });
    }

    const availabilityResponse = await fetch(
      "http://localhost:5000/api/rooms/availability",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: req.body.roomId,
          checkInDate: req.body.checkInDate,
          checkOutDate: req.body.checkOutDate,
        }),
      }
    );

    const availabilityData = await availabilityResponse.json();

    if (
      !availabilityResponse.ok ||
      availabilityData.availableRooms < req.body.NoofRoom
    ) {
      return res.status(400).json({
        success: false,
        message: availabilityData.message || "Not enough rooms available",
        availableRooms: availabilityData.availableRooms,
      });
    }

    // Create Razorpay order
    const options = {
      amount: req.body.amount, // Amount in paise
      currency: req.body.currency || "INR",
      receipt: req.body.receipt,
      notes: req.body.notes,
    };

    const order = await razorpayInstance.orders.create(options);

    // Create booking record
    const booking = new Booking({
      ...req.body,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    await booking.save();

    // Prepare response
    const response = {
      success: true,
      orderId: order.id,
      paymentData: {
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Zeenath Taj Garden",
        description: `Booking for ${req.body.roomName}`,
        order_id: order.id,
        prefill: {
          name: req.body.name,
          email: req.body.email,
          contact: req.body.mobilenumber,
        },
        theme: {
          color: "#3399cc",
        },
      },
      bookingId: booking._id,
    };

    res.json(response);
  } catch (err) {
    console.error("Error creating Razorpay order:", {
      message: err.message,
      stack: err.stack,
      errorDetails: err.response?.data,
    });

    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Missing payment verification parameters",
    //   });
    // }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update booking status
    const booking = await Booking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "confirmed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentDate: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this payment",
      });
    }

    // // Generate invoice
    // let pdfBuffer;
    // try {
    //   pdfBuffer = await generateInvoice(booking);
    // } catch (pdfError) {
    //   console.error("PDF generation failed:", pdfError);
    //   return res.status(500).json({
    //     success: false,
    //     message: "Booking confirmed but invoice generation failed",
    //     bookingId: booking._id,
    //   });
    // }

    // // Send email with invoice
    // try {
    //   await sendInvoiceEmail(booking, pdfBuffer);
    // } catch (emailError) {
    //   console.error("Email sending failed:", emailError);
    //   return res.status(500).json({
    //     success: false,
    //     message: "Booking confirmed but invoice email failed to send",
    //     bookingId: booking._id,
    //     downloadLink: `/api/bookings/${booking._id}/invoice`, // Provide a download link
    //   });
    // }

     // Get the populated booking data you need for the invoice
     const bookingForInvoice = await Booking.findById(booking._id).lean();
    

    // Success response
    res.status(200).json({
      success: true,
      message: "Payment verified successfully & invoice sent",
      bookingId: booking._id,
      paymentId: razorpay_payment_id,

      triggerInvoice: true,  //trigger the invoice download in the fronend

    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};
