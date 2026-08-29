import mongoose from 'mongoose';

// Called on server start — connects to MongoDB Atlas
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.log("This error from database...")
        process.exit(1);
    }
}
