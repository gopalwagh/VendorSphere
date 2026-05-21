import  mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.Mongo_URI);
    console.log(`MongoDB Connected :${conn.connection.host}`)
    
  } catch (error) {
    console.log("Database Connection error: ",error.message);
    process.exit(1);

  }
}

export default connectDB;