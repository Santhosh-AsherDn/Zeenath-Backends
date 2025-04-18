import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    address: { type: String },
    source: { type: String, default: "Website" },
    roomId: { type: Number, required: true },
    roomName: { type: String, required: true },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    numberofNights: { type: Number, required: true },
    NoofRoom: { type: Number, required: true },
    extraBed: { type: Number, required: true, default: 0 },
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    gstPercentage: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Cancelled"],
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
