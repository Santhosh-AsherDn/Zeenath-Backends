import nodemailer from "nodemailer";

export const sendInvoiceEmail = async (booking, pdfBuffer) => {
  if (!booking || !booking._id) {
    throw new Error("Invalid booking object or missing _id");
  }

  if (!pdfBuffer) {
    throw new Error("Missing PDF buffer for invoice attachment");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Format dates
  const checkInDate = new Date(booking.checkInDate).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const mailOptions = {
    from: `Zeenath Taj Garden <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `Your Booking Confirmation #${booking._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Booking Confirmed!</h2>
        <p>Dear ${booking.name},</p>
        <p>Thank you for choosing Zeenath Taj Garden. Your booking has been confirmed.</p>

        <h3 style="color: #0066cc;">Booking Summary</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${booking._id
            .toString()
            .slice(-6)}</li>
          <li><strong>Room:</strong> ${booking.roomName}</li>
           <li><strong>Check-in:</strong> ${checkInDate}</li>
          <li><strong>Check-out:</strong> ${checkOutDate}</li>
          <li><strong>Total:</strong> ₹${booking.total.toFixed(2)}</li>
        </ul>

         <p>Your invoice is attached to this email. We look forward to hosting you!</p>
        <p>Best regards,<br>The Zeenath Taj Garden Team</p>
        <p style="font-size: 12px; color: #999;">This is an automated email. Do not reply.</p>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice_${booking._id.toString().slice(-6)}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
