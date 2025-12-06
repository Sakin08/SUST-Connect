import mongoose from "mongoose";
import dotenv from "dotenv";
import Election from "../models/Election.js";
import ElectionPosition from "../models/ElectionPosition.js";
import Candidate from "../models/Candidate.js";
import User from "../models/User.js";

dotenv.config();

const checkElectionData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get the latest election
    const election = await Election.findOne().sort({ createdAt: -1 });

    if (!election) {
      console.log("❌ No elections found");
      process.exit(0);
    }

    console.log("📊 Latest Election:");
    console.log(`   Title: ${election.title}`);
    console.log(`   Type: ${election.type}`);
    console.log(`   ID: ${election._id}\n`);

    // Get positions for this election
    const positions = await ElectionPosition.find({ election: election._id });
    console.log(`📋 Positions (${positions.length}):`);
    positions.forEach((pos, idx) => {
      console.log(`   ${idx + 1}. ${pos.positionName} (ID: ${pos._id})`);
    });
    console.log();

    // Get candidates for this election
    const candidates = await Candidate.find({ election: election._id })
      .populate("user", "name registrationNumber")
      .populate("position", "positionName");

    console.log(`👥 Candidates (${candidates.length}):`);
    candidates.forEach((cand, idx) => {
      console.log(
        `   ${idx + 1}. ${cand.user?.name || "Unknown"} (${
          cand.user?.registrationNumber || "N/A"
        })`
      );
      console.log(
        `      Position: ${cand.position?.positionName || "Unknown"} (ID: ${
          cand.position?._id || "N/A"
        })`
      );
      console.log(`      Status: ${cand.status}`);
    });
    console.log();

    // Group candidates by position
    console.log("📊 Candidates by Position:");
    positions.forEach((pos) => {
      const positionCandidates = candidates.filter(
        (c) => c.position?._id.toString() === pos._id.toString()
      );
      console.log(
        `   ${pos.positionName}: ${positionCandidates.length} candidates`
      );
      positionCandidates.forEach((c) => {
        console.log(`      - ${c.user?.name || "Unknown"}`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkElectionData();
