import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function cleanupCandidates() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const candidatesCollection = db.collection("candidates");

    // Find all candidates
    const allCandidates = await candidatesCollection.find({}).toArray();

    console.log(`📊 Found ${allCandidates.length} candidate records:\n`);

    if (allCandidates.length > 0) {
      allCandidates.forEach((candidate, index) => {
        console.log(`${index + 1}. User: ${candidate.user}`);
        console.log(`   Election: ${candidate.election}`);
        console.log(`   Position: ${candidate.position}`);
        console.log(`   Status: ${candidate.status}`);
        console.log(`   Created: ${candidate.createdAt}\n`);
      });

      // Delete all candidates
      console.log("🗑️  Deleting ALL candidate records...");
      const result = await candidatesCollection.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} candidate records`);

      // Drop all indexes
      console.log("\n🔧 Dropping all indexes...");
      await candidatesCollection.dropIndexes();
      console.log("✅ All indexes dropped");

      // Recreate the proper indexes
      console.log("\n🔨 Recreating indexes...");
      await candidatesCollection.createIndex(
        { election: 1, position: 1, user: 1 },
        { unique: true }
      );
      await candidatesCollection.createIndex({
        election: 1,
        position: 1,
        status: 1,
      });
      console.log("✅ Indexes recreated");

      // Verify
      const indexes = await candidatesCollection.indexes();
      console.log("\n📋 Current indexes:");
      indexes.forEach((index) => {
        console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } else {
      console.log("ℹ️  No candidates found in database");
    }

    console.log("\n✨ Cleanup complete! You can now add candidates fresh.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
}

cleanupCandidates();
