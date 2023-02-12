import { ISession } from "models"
import mongoose from "mongoose"

import { USER_SCHEMA } from "../config/data"



const sessionSchema = new mongoose.Schema<ISession>({
    user: { type: mongoose.Types.ObjectId, refPath: "userSchema", required: [true, "Session: user is required"] },
    userSchema: { type: String, required: [true, "userSchema is required"], enum: { values: USER_SCHEMA, message: `userSchema must be any of: ${USER_SCHEMA}` } },
    ip: { type: [String], trim: true, required: [true, "ipV4 is required"] },
    userAgent: { type: String, trim: true, required: [true, "userAgent is required"] },

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})

sessionSchema.virtual("activityStackTrace", {
    ref: "Activity",
    foreignField: "session",
    localField: "_id"
})

export default mongoose.model("Session", sessionSchema)