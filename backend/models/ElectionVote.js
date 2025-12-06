import mongoose from "mongoose";

const electionVoteSchema = new mongoose.Schema(
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
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double voting for same position
electionVoteSchema.index(
  { election: 1, position: 1, voter: 1 },
  { unique: true }
);
electionVoteSchema.index({ election: 1, candidate: 1 });

export default mongoose.model("ElectionVote", electionVoteSchema);
