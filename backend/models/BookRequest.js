import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    offerType: {
      type: String,
      enum: ["can-lend", "can-sell", "know-where", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

const bookRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookTitle: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    requestType: {
      type: String,
      enum: ["borrow", "need-to-buy", "looking-for"],
      default: "borrow",
    },
    description: {
      type: String,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ["urgent", "normal"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["open", "fulfilled", "closed"],
      default: "open",
    },
    responses: [responseSchema],
    images: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for performance
bookRequestSchema.index({ requester: 1, createdAt: -1 });
bookRequestSchema.index({ status: 1, createdAt: -1 });
bookRequestSchema.index({ course: 1 });
bookRequestSchema.index({ bookTitle: "text", author: "text", course: "text" });

export default mongoose.model("BookRequest", bookRequestSchema);
