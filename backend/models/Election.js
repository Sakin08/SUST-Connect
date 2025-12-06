import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    // For CR elections - batch number (16-25)
    year: {
      type: Number,
      required: function () {
        return this.type === "cr";
      },
    },
    // Timing
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "ended"],
      default: "upcoming",
    },
    // Settings
    allowChangeVote: {
      type: Boolean,
      default: false,
    },
    showLiveResults: {
      type: Boolean,
      default: false,
    },
    resultsPublished: {
      type: Boolean,
      default: false,
    },
    // Creator (admin who created/approved the election)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Original requester (user who requested the election)
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on time
electionSchema.methods.updateStatus = function () {
  const now = new Date();
  if (now < this.startTime) {
    this.status = "upcoming";
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = "ongoing";
  } else {
    this.status = "ended";
  }
  return this.save();
};

// Index for faster queries
electionSchema.index({ department: 1, type: 1, status: 1 });
electionSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model("Election", electionSchema);
