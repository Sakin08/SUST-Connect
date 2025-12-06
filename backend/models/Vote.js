import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // This field is ONLY accessible to super admin
      select: false,
    },
    selectedOptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    // For feedback/surveys with text responses
    textResponse: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one vote per user per poll
voteSchema.index({ poll: 1, voter: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
