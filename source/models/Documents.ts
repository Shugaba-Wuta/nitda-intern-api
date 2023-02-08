import mongoose from "mongoose"
import { USER_ROLES } from "../config/data"

const documentSchema = new mongoose.Schema({
    title: { type: String, required: [true, " document title is required"] },
    slug: { type: String, required: [true, " document slug is required"] },
    link: { type: String, required: [true, "document link is required"] },
    deleted: { type: Boolean, default: false },
    deletedOn: { type: Date },
    internSchema: { type: String, required: [true, "internSchema is required"], enum: { values: USER_ROLES, message: `internSchema must be any of: ${USER_ROLES}` } },
    intern: { type: mongoose.Types.ObjectId, refPath: "internSchema" },


}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})
export default mongoose.model("Document", documentSchema)