
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        "MONGO_URI is missing. Please check the .env file in the project root."
      );
    }

    await mongoose.connect(uri, {
      retryWrites: false,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
