import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    location: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical", "urgent"],
      default: "medium",
    },
    message: { type: String },
    description: { type: String }, // Alias for message
    contactPhone: { type: String, required: true },
    contactNumber: { type: String }, // Alias for contactPhone
    neededBy: { type: Date },
    requiredDate: { type: Date }, // Alias for neededBy
    patientName: { type: String },
    patientAge: { type: Number },
    hospital: { type: String },
    status: {
      type: String,
      enum: ["open", "fulfilled", "cancelled", "active"],
      default: "open",
    },
    responses: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        message: String,
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bloodRequestSchema.index({ bloodGroup: 1, status: 1 });
bloodRequestSchema.index({ requester: 1 });

export default mongoose.model("BloodRequest", bloodRequestSchema);
