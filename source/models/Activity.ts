import mongoose from "mongoose"

const activitySchema = new mongoose.Schema({
    queryParam: { type: String },
    url: { type: String, required: [true, "Activity: url is required"] },
    createdAt: { type: Date, default: Date.now },
    session: { type: mongoose.Types.ObjectId, ref: "Session" },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})