// import nodemailer from "nodemailer";

// export const sendInvoiceEmail = async (booking, pdfBuffer) => {
//   //using instead of invoicePath
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST, // e.g., smtp.example.com
//     port: process.env.EMAIL_PORT, // Usually 465 (SSL) or 587 (TLS)
//     secure: process.env.EMAIL_PORT == "465", // true for 465, false for 587
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   const mailOptions = {
//     from: `Zeenath Taj <${process.env.EMAIL_USER}>`,
//     to: booking.email,
//     subject: "Your Room Booking Invoice",
//     text: `Hi ${booking.name}, \n\nThanks for your booking! \n\nPlease find your invoice attached. \n\nBest regards, \nZeenath Taj Management`,
//     attachments: [
//       {
//         filename: `invoice_${booking._id}.pdf`,
//         // path: invoicePath,
//         content: pdfBuffer, // Attach the PDF buffer directly
//       },
//     ],
//   };

//   await transporter.sendMail(mailOptions);
// };

import nodemailer from 'nodemailer';

export const sendInvoiceEmail = async (booking, pdfBuffer) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `Zeenath Taj Garden <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Your Booking Confirmation #${booking._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Booking Confirmed!</h2>
          <p>Dear ${booking.name},</p>
          <p>Thank you for choosing Zeenath Taj Garden for your stay. Your booking has been confirmed.</p>
          
          <h3 style="color: #0066cc; margin-top: 20px;">Booking Summary</h3>
          <ul>
            <li><strong>Booking ID:</strong> ${booking._id.toString().slice(-6)}</li>
            <li><strong>Room:</strong> ${booking.roomName}</li>
            <li><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</li>
            <li><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
            <li><strong>Total:</strong> ₹${booking.total.toFixed(2)}</li>
          </ul>
          
          <p>Please find your invoice attached for your records.</p>
          <p>We look forward to welcoming you!</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Zeenath Taj Garden Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${booking._id.toString().slice(-6)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully');
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};