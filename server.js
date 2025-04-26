import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import roomAvailabilityRoutes from "./routes/roomAvailability.routes.js";
import invoiceRoutes from "./routes/invoiceRoute.js";
import weatherRoutes from "./routes/weatherRoutes.js";
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/rooms", roomAvailabilityRoutes);
app.use("/api", invoiceRoutes);
app.use("/api/weather", weatherRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
