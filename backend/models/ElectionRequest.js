import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
  },
  name: String,
  manifesto: String,
  positionName: String, // Store which position this candidate is for
});

const electionRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["society", "cr"],
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: function () {
        return this.type === "cr";
      },
    },
    section: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    proposedStartDate: {
      type: Date,
      required: true,
    },
    proposedEndDate: {
      type: Date,
      required: true,
    },
    positions: [
      {
        positionName: String,
        description: String,
      },
    ],
    candidates: [candidateSchema],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    title: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    adminNotes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    createdElection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },
  },
  {
    timestamps: true,
  }
);

electionRequestSchema.index({ requestedBy: 1, status: 1 });
electionRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ElectionRequest", electionRequestSchema);
