import mongoose from "mongoose"

const activitySchema = new mongoose.Schema({
    url: { type: String, required: [true, "Activity: url is required"] },
    method: { type: String, required: [true, "Activity: method is required"] },
    body: { type: String },
    createdAt: { type: Date, default: Date.now },
    session: { type: mongoose.Types.ObjectId, ref: "Session" },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})