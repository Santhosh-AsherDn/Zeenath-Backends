import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    _id: mongoose.Schema.Types.ObjectId,
    roomId: {
      type: Number,
      required: true,
      unique: true,
    }, // MongoDB's default ID
    name: { type: String, required: true },
    description: String,
    image: String,
    path: { type: String, unique: true },
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
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret._id = ret._id.toString(); // Ensure _id is converted to string
        delete ret.__v;
        return ret;
      },
    },
  }
);

// roomSchema.index({ id: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
