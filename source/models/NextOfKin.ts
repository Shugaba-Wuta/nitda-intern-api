import { NextFunction } from "express";
import mongoose from "mongoose";
import { USER_ROLES } from "../config/data";

const nextOfKinSchema = new mongoose.Schema({
    intern: { type: mongoose.Types.ObjectId, refPath: "internSchema" },
    internSchema: { type: String, required: [true, "internSchema is required"], enum: { values: USER_ROLES, message: `internSchema must be any of: ${USER_ROLES}` } },
    phoneNumber: { type: String, required: [true, "nexOfKin phoneNumber is required"] },
    name: { type: String, required: ["nextOfKin name is required"] },
    email: String
})




export default mongoose.model("NextOfKin", nextOfKinSchema)