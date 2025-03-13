import mongoose from "mongoose";
import { DB_NAME } from "./constraints.js"; // the name is imported from constraints file

import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';

import connectDB from "./db/index.js";
connectDB()

.then(() => {
    app.on("error", (error) => {
        console.log("ERROR", error);
        // Handle the error appropriately within this scope
    });

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server is running at port: ${port}`);
    });
})
.catch((error) => {
    console.log("MONGODB connection has FAILED !!!", error);
});













/*
import express from 'express';
const app = express();

// we never directly call the databases; we do it in try-catch or using promises. Here is IIFE code, we also use async

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);  // if process.env.MONGODB_URI is mongodb://localhost:27017 and DB_NAME is mydatabase, the resulting connection string would be mongodb://localhost:27017/mydatabase

        app.on("error" , (error)=>{
            console.error("Error :" , error);
            throw error;


        })

        app.listen(process.env.PORT , ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("ERROR", error);
        throw error;
    }
})();

*/