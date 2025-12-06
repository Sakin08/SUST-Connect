import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function dropBadIndex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const candidatesCollection = db.collection("candidates");

    // List all current indexes
    console.log("📋 Current indexes:");
    const indexes = await candidatesCollection.indexes();
    indexes.forEach((index) => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the bad index
    console.log(
      "\n🗑️  Dropping bad index: election_1_position_1_guestRegistrationNumber_1"
    );
    try {
      await candidatesCollection.dropIndex(
        "election_1_position_1_guestRegistrationNumber_1"
      );
      console.log("✅ Bad index dropped successfully");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  Index does not exist (already dropped)");
      } else {
        throw error;
      }
    }

    // Verify the correct indexes exist
    console.log("\n🔨 Ensuring correct indexes...");
    await candidatesCollection.createIndex(
      { election: 1, position: 1, user: 1 },
      { unique: true }
    );
    await candidatesCollection.createIndex({
      election: 1,
      position: 1,
      status: 1,
    });
    console.log("✅ Correct indexes created");

    // List final indexes
    console.log("\n📋 Final indexes:");
    const finalIndexes = await candidatesCollection.indexes();
    finalIndexes.forEach((index) => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log("\n✨ All done! Try adding candidates now.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
}

dropBadIndex();
