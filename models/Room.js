import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    image: String,
    path: String,
    rate: { type: Number, required: true },
    gst: String,
    gstPercentage: Number,
    extraBedRate: Number,
    cancel: String,
    size: String,
    capacity: {
      adults: { type: Number },
      children: { type: Number },
    },
    numberOfRooms: { type: Number, required: true },
    extraPerson: String,
    occupancy: String,
    amenities: [
      {
        icon: String,
        label: String,
      },
    ],
    gallery: [String],
  },
  {
    _id: false, // Disable the default _id field
    timestamps: true,
  }
);

// roomSchema.index({ id: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);
