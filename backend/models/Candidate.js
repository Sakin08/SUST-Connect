import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ElectionPosition",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    manifesto: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate candidacy
candidateSchema.index({ election: 1, position: 1, user: 1 }, { unique: true });
candidateSchema.index({ election: 1, position: 1, status: 1 });

export default mongoose.model("Candidate", candidateSchema);
