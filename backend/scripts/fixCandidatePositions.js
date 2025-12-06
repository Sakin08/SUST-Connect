import mongoose from "mongoose";
import dotenv from "dotenv";
import Candidate from "../models/Candidate.js";
import ElectionPosition from "../models/ElectionPosition.js";
import User from "../models/User.js";

dotenv.config();

const fixCandidatePositions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const electionId = "69348b8ceb02a113d670f73b"; // Your election ID

    // Get positions
    const positions = await ElectionPosition.find({
      election: electionId,
    }).sort({ order: 1 });
    console.log("📋 Positions:");
    positions.forEach((pos, idx) => {
      console.log(`   ${idx}. ${pos.positionName} (${pos._id})`);
    });
    console.log();

    // Get all candidates
    const candidates = await Candidate.find({ election: electionId }).populate(
      "user",
      "name registrationNumber"
    );

    console.log(`👥 Found ${candidates.length} candidates\n`);

    // Manually assign candidates to positions
    // You need to specify which candidates go to which position
    const assignments = [
      // VP position (index 0)
      { regNo: "2021331008", positionIndex: 0 }, // Md Sakin
      { regNo: "2021331003", positionIndex: 0 }, // MD ARIF AHMED

      // GS position (index 1)
      { regNo: "2021331064", positionIndex: 1 }, // Farhana marium
      { regNo: "2021331007", positionIndex: 1 }, // ASM Ashik

      // EM position (index 2)
      { regNo: "2021331009", positionIndex: 2 }, // Limon Hassan
      { regNo: "2021331001", positionIndex: 2 }, // Tanvir hasan
    ];

    console.log("🔄 Reassigning candidates...\n");

    for (const assignment of assignments) {
      const candidate = candidates.find(
        (c) => c.user.registrationNumber === assignment.regNo
      );

      if (candidate) {
        const newPosition = positions[assignment.positionIndex];
        candidate.position = newPosition._id;
        await candidate.save();
        console.log(`✅ ${candidate.user.name} → ${newPosition.positionName}`);
      } else {
        console.log(`❌ Candidate not found: ${assignment.regNo}`);
      }
    }

    console.log("\n✅ Done! Candidates reassigned.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixCandidatePositions();
