import mongoose from "mongoose";
import { DB_NAME } from "../constraints.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB Host : ${connectionInstance.connection.host}`);
        console.log(connectionInstance); // Print the connection instance to understand its structure
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1); // for 0 is success and for 1 it terminates
    }
}

export default connectDB;
