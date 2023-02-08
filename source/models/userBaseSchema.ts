import mongoose from "mongoose"


export const userBaseSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, 'firstName is required'] },
    middleName: { type: String },
    lastName: { type: String, required: [true, 'lastName is required'] },
    role: { type: String, required: [true, "role is required"] },
    permissions: { type: [String], required: [true, "permissions are required"] },
    password: { type: String, required: [true, "password is required"] },
    email: { type: String, required: [true, "email is required"] },
    deleted: { type: Boolean, default: false },
    nitdaID: { type: String, required: [true, "nitdaID is required"] },
    deletedOn: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }


}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })