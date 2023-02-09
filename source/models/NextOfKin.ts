import { NextFunction } from "express";
import mongoose from "mongoose";
import { USER_ROLES } from "../config/data";

const nextOfKinSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, refPath: "userSchema" },
    userSchema: { type: String, required: [true, "userSchema is required"], enum: { values: USER_ROLES, message: `userSchema must be any of: ${USER_ROLES}` } },
    phoneNumber: { type: String, required: [true, "nexOfKin phoneNumber is required"] },
    name: { type: String, required: ["nextOfKin name is required"] },
    email: String
})




export default mongoose.model("NextOfKin", nextOfKinSchema)