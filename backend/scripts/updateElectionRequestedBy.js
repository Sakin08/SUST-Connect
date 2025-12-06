import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Election from "../models/Election.js";
import ElectionRequest from "../models/ElectionRequest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const updateElectionRequestedBy = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all approved election requests that have a createdElection
    const approvedRequests = await ElectionRequest.find({
      status: "approved",
      createdElection: { $exists: true, $ne: null },
    });

    console.log(`Found ${approvedRequests.length} approved election requests`);

    let updated = 0;
    for (const request of approvedRequests) {
      const election = await Election.findById(request.createdElection);

      if (election && !election.requestedBy) {
        election.requestedBy = request.requestedBy;
        await election.save();
        console.log(`✅ Updated election: ${election.title}`);
        updated++;
      } else if (election && election.requestedBy) {
        console.log(`⏭️  Election already has requestedBy: ${election.title}`);
      } else {
        console.log(`❌ Election not found for request: ${request._id}`);
      }
    }

    console.log(`\n✅ Updated ${updated} elections`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

updateElectionRequestedBy();
