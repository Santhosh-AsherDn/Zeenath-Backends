import crypto from "crypto";
import Booking from "../models/Booking.js";
import { razorpayInstance } from "../config/razorpay.js";

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

    // Prepare response
    res.json({
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
        theme: { color: "#3399cc" },
      },
    });
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
    console.log("Received payment verification request:", req.body);
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingDetails,
    } = req.body;

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
    // Create booking record after successful payment verification

    const bookingData = new Booking({
      ...bookingDetails,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentDate: new Date(),
      status: "Confirmed", // directly confirmed after payment
    });

    const booking = new Booking(bookingData);
    await booking.save();
    console.log("Booking saved successfully:", booking);

    // Success response
    res.status(200).json({
      success: true,
      message: "Payment verified successfully & invoice sent",
      bookingId: booking._id,
      paymentId: razorpay_payment_id,

      triggerInvoice: true, //trigger the invoice download in the fronend
    });
  } catch (err) {
    console.error("Payment verification error:", {
      message: err.message,
      stack: err.stack,
      errorDetails: err.errors, 
    });
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        validationErrors: err.errors,
      }),
    });
  }
};
