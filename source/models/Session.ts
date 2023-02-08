import mongoose from "mongoose"

import { USER_ROLES } from "../config/data"



const sessionSchema = new mongoose.Schema({
    intern: { type: mongoose.Types.ObjectId, refPath: "internSchema" },
    internSchema: { type: String, required: [true, "internSchema is required"], enum: { values: USER_ROLES, message: `internSchema must be any of: ${USER_ROLES}` } },
    ipV4: { type: String, trim: true, required: [true, "ipV4 is required"] },
    ipV6: { type: String, trim: true },
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