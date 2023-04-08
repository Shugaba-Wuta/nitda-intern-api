import mongoose, { Model, Schema } from "mongoose"
import { USER_SCHEMA } from "../config/data"
import { IDocument } from "../types/models"

type DocumentModel = Model<IDocument, {}>

const documentSchema = new Schema<IDocument, DocumentModel>({
    slug: { type: String, required: [true, " document slug is required"] },
    link: { type: String, required: [true, "document link is required"] },
    deleted: { type: Boolean, default: false },
    deletedOn: { type: Date },
    userSchema: { type: String, required: [true, "userSchema is required"], enum: { values: USER_SCHEMA, message: `userSchema must be any of: ${USER_SCHEMA}` } },
    user: { type: mongoose.Types.ObjectId, refPath: "userSchema" },


}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})
export default mongoose.model("Document", documentSchema)