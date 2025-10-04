import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`\n❌ FATAL ERROR: Database connection failed!`);
    console.error(`❌ Error: ${error.message}`);
    console.error(`\n💡 Solution:`);
    console.error(`   1. Go to https://cloud.mongodb.com/`);
    console.error(`   2. Navigate to Network Access`);
    console.error(`   3. Add your IP address or 0.0.0.0/0`);
    console.error(`   4. Wait 1-2 minutes and restart server\n`);
    console.error(`⛔ Server cannot start without database connection!`);
    console.error(`⛔ Exiting process...\n`);
    process.exit(1); // Exit with error code
  }
};
