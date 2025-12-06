import mongoose from "mongoose";
import dotenv from "dotenv";
import ElectionRequest from "../models/ElectionRequest.js";

dotenv.config();

const checkElectionRequest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get the latest election request
    const request = await ElectionRequest.findOne().sort({ createdAt: -1 });

    if (!request) {
      console.log("❌ No election requests found");
      process.exit(0);
    }

    console.log("📊 Latest Election Request:");
    console.log(`   Type: ${request.type}`);
    console.log(`   Department: ${request.department}`);
    console.log(`   Status: ${request.status}`);
    console.log(`   ID: ${request._id}\n`);

    console.log(`📋 Positions (${request.positions?.length || 0}):`);
    if (request.positions) {
      request.positions.forEach((pos, idx) => {
        console.log(`   ${idx + 1}. ${pos.positionName}`);
      });
    }
    console.log();

    console.log(`👥 Candidates (${request.candidates?.length || 0}):`);
    if (request.candidates) {
      request.candidates.forEach((cand, idx) => {
        console.log(`   ${idx + 1}. Reg: ${cand.registrationNumber}`);
        console.log(`      Position: ${cand.positionName || "NOT SET"}`);
        console.log(`      Name: ${cand.name || "N/A"}`);
      });
    }
    console.log();

    // Group by position
    if (request.candidates && request.candidates.length > 0) {
      console.log("📊 Candidates by Position:");
      const grouped = {};
      request.candidates.forEach((c) => {
        const pos = c.positionName || "UNASSIGNED";
        if (!grouped[pos]) grouped[pos] = [];
        grouped[pos].push(c.registrationNumber);
      });

      Object.keys(grouped).forEach((pos) => {
        console.log(`   ${pos}: ${grouped[pos].length} candidates`);
        grouped[pos].forEach((reg) => {
          console.log(`      - ${reg}`);
        });
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkElectionRequest();
