import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // Check for the specific registration numbers
    const regNumbers = ["2021331008", "2021331009", "2021331010"]; // Add the ones that fail

    console.log("🔍 Checking users with registration numbers:\n");

    for (const regNum of regNumbers) {
      const user = await db
        .collection("users")
        .findOne({ registrationNumber: regNum });
      if (user) {
        console.log(`✅ ${regNum}:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}\n`);
      } else {
        console.log(`❌ ${regNum}: NOT FOUND\n`);
      }
    }

    // Check all candidates
    console.log("\n📋 All candidates in database:");
    const candidates = await db.collection("candidates").find({}).toArray();

    if (candidates.length === 0) {
      console.log("   (none)\n");
    } else {
      for (const candidate of candidates) {
        const user = await db
          .collection("users")
          .findOne({ _id: candidate.user });
        console.log(
          `   - User: ${user?.name || "Unknown"} (${
            user?.registrationNumber || "N/A"
          })`
        );
        console.log(`     Election: ${candidate.election}`);
        console.log(`     Position: ${candidate.position}\n`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
}

checkUsers();
