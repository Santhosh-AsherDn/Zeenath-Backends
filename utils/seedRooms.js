// utils/seedRooms.js
import Room from '../models/Room.js';
import { rooms } from '../data/roomsData.js'; // Import your rooms data
import { connectDB } from '../config/db.js';
// import { image, path } from 'pdfkit';

const seedRooms = async () => {
  try {
    await connectDB();
    
    // Delete existing rooms
    await Room.deleteMany({});
    
    // Insert new rooms with numeric ids
    const roomsToInsert = rooms.map(room => ({
      id: room.id, 
      name: room.name,
      description: room.description,
      image: room.image,
      path: room.path,
      rate: room.rate,
      gst: room.gst,
      gstPercentage: room.gstPercentage,
      extraBedRate: room.extraBedRate,
      cancel: room.cancel,
      size: room.size,
      capacity: room.capacity,
      extraPerson: room.extraPerson,
      occupancy: room.occupancy,
      amenities: room.amenities,
      gallery: room.gallery,
      numberOfRooms: room.numberOfRooms
    }));
    
    const insertedRooms = await Room.insertMany(roomsToInsert);
    
    console.log(`${insertedRooms.length} rooms inserted successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
};

seedRooms();