import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  // For candidate elections
  candidateInfo: {
    name: String,
    studentId: String,
    department: String,
    batch: String,
    cgpa: Number,
    manifesto: String,
    photo: String,
    experience: String, // Previous positions held
    contactEmail: String,
    contactPhone: String,
  },
});

const pollSchema = new mongoose.Schema(
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
      enum: ["opinion", "election", "feedback", "survey"],
      default: "opinion",
    },
    pollType: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
    },
    category: {
      type: String,
      enum: [
        "general",
        "academic",
        "club",
        "union",
        "department",
        "hall",
        "transport",
        "dining",
        "hostel",
        "event",
        "other",
      ],
      default: "general",
    },

    // Election-specific fields
    electionInfo: {
      position: String, // e.g., "President", "General Secretary"
      organization: String, // e.g., "SUCSU", "Computer Club", "CSE Department"
      eligibleVoters: {
        departments: [String],
        batches: [String],
        halls: [String],
      },
    },

    options: [pollOptionSchema],

    // Creator info
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Permissions
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    allowedVoters: {
      type: String,
      enum: ["all", "department", "batch", "club"],
      default: "all",
    },
    restrictions: {
      departments: [String],
      batches: [String],
      clubs: [String],
    },

    // Timing
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "ended", "cancelled"],
      default: "active",
    },

    // Stats
    totalVotes: {
      type: Number,
      default: 0,
    },

    // Settings
    showLiveResults: {
      type: Boolean,
      default: true,
    },
    allowChangeVote: {
      type: Boolean,
      default: false,
    },

    // For club elections
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pollSchema.index({ status: 1, endDate: -1 });
pollSchema.index({ type: 1, category: 1 });
pollSchema.index({ createdBy: 1 });

// Check if poll is active
pollSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "active" && now >= this.startDate && now <= this.endDate
  );
};

// Auto-update status based on dates
pollSchema.pre("save", function (next) {
  const now = new Date();
  if (this.status === "active" && now > this.endDate) {
    this.status = "ended";
  }
  next();
});

export default mongoose.model("Poll", pollSchema);
