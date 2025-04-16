// controllers/roomAvailability.controller.js
import Booking from "../models/Booking.js";
// import Room from "../models/Room.js";

export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    console.log("Received availability check:", {
      roomId,
      checkInDate,
      checkOutDate,
    });

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, checkInDate, checkOutDate",
      });
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Get room information from roomsData
    const { rooms } = await import("../data/roomsData.js");
    const roomData = rooms.find((r) => r.id === parseInt(roomId));

    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: `Room not found with ID: ${roomId}`,
      });
    }

    // Get all bookings for this room
    const bookings = await Booking.find({ roomId: roomData.id });

    // Filter bookings that overlap with the requested dates and are not cancelled
    const overlappingBookings = bookings.filter((booking) => {
      const bookingStart = new Date(booking.checkInDate);
      const bookingEnd = new Date(booking.checkOutDate);
      const isNotCancelled = booking.status !== "cancelled";
      const isOverlapping = bookingStart < endDate && bookingEnd > startDate;
      return isNotCancelled && isOverlapping;
    });

    // Calculate total rooms booked during the overlapping period
    const totalBookedRooms = overlappingBookings.reduce((sum, booking) => {
      return sum + parseInt(booking.NoofRoom || 0, 10);
    }, 0);

    const availableRooms = Math.max(
      0,
      roomData.numberOfRooms - totalBookedRooms
    );

    // Prepare response
    const response = {
      success: true,
      availableRooms,
      totalRooms: roomData.numberOfRooms,
      bookedRooms: totalBookedRooms,
      roomType: roomData.name,
      isAvailable: availableRooms > 0,
      message:
        availableRooms > 0
          ? `${availableRooms} rooms available`
          : "No rooms available for selected dates",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({
      success: false,
      message: "Error checking room availability",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
