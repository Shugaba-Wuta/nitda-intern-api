import { NextFunction } from "express";
import mongoose from "mongoose";

import { USER_ROLES } from "../config/data"


const accountSchema = new mongoose.Schema({
    bankName: { type: String, required: [true, "bankName is required"] },
    accountNumber: { type: String, required: [true, "accountNumber is required"], unique: true },
    bankCode: { type: Number, min: 0, required: [true, "bankCode is required"] },
    intern: { type: mongoose.Types.ObjectId, refPath: "internSchema" },
    internSchema: { type: String, required: [true, "internSchema is required"], enum: { values: USER_ROLES, message: `internSchema must be any of: ${USER_ROLES}` } },
    default: { type: Boolean, default: true }

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
accountSchema.post("validate", async function () {
    if (this.default) {
        await this.$model(`Account`).updateMany({ internSchema: this.internSchema, intern: this.intern, default: true }, { default: false })
    }
})

export default mongoose.model("Account", accountSchema)