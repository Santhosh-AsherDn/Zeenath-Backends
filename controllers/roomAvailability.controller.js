// controllers/roomAvailability.controller.js
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

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

    // Try to find the room in the DB
    let room = await Room.findOne({ id: parseInt(roomId) });

    // If not found in DB, fall back to roomsData
    if (!room) {
      const { rooms } = await import("../data/roomsData.js");
      const roomData = rooms.find((r) => r.id === parseInt(roomId));

      if (!roomData) {
        return res.status(404).json({
          success: false,
          message: `Room not found with ID: ${roomId}`,
        });
      }

      // Use roomData for availability check
      const overlappingBookings = await Booking.find({
        roomId: roomId.toString(),
        status: { $ne: "cancelled" },
        $or: [
          {
            checkInDate: { $lt: endDate },
            checkOutDate: { $gt: startDate },
          },
        ],
      });

      const totalBookedRooms = overlappingBookings.reduce((sum, booking) => {
        return sum + parseInt(booking.NoofRoom || 0);
      }, 0);

      const availableRooms = roomData.numberOfRooms - totalBookedRooms;

      return res.status(200).json({
        success: true,
        availableRooms,
        totalRooms: roomData.numberOfRooms,
        message:
          availableRooms > 0
            ? `${availableRooms} rooms available`
            : "No rooms available for selected dates",
      });
    }

    // Proceed with DB room data
    const overlappingBookings = await Booking.find({
      roomId: roomId.toString(),
      status: { $ne: "cancelled" },
      $or: [
        {
          checkInDate: { $lt: endDate },
          checkOutDate: { $gt: startDate },
        },
      ],
    });

    const totalBookedRooms = overlappingBookings.reduce((sum, booking) => {
      return sum + parseInt(booking.NoofRoom || 0);
    }, 0);

    const availableRooms = room.numberOfRooms - totalBookedRooms;

    return res.status(200).json({
      success: true,
      availableRooms,
      totalRooms: room.numberOfRooms,
      message:
        availableRooms > 0
          ? `${availableRooms} rooms available`
          : "No rooms available for selected dates",
    });
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
