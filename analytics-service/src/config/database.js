import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/weather";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Analytics Service connected to MongoDB");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

export default mongoose;
