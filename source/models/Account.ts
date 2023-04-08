import { IAccount } from "models";
import mongoose, { Model } from "mongoose";

import { INTERN_SCHEMA } from "../config/data"

type AccountModel = Model<IAccount>

const accountSchema = new mongoose.Schema<IAccount, AccountModel>({
    bankName: { type: String, required: [true, "bankName is required"] },
    accountNumber: { type: String, required: [true, "accountNumber is required"] },
    bankCode: { type: Number, min: 0, required: [true, "bankCode is required"] },
    intern: { type: mongoose.Types.ObjectId, refPath: "internSchema" },
    internSchema: { type: String, required: [true, "internSchema is required"], enum: { values: INTERN_SCHEMA, message: `internSchema must be any of: ${INTERN_SCHEMA}` } },
    // default: { type: Boolean, default: true }

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
//
// Removed because default props has been removed.
//
// accountSchema.post("validate", async function () {
//     if (this.default) {
//         await this.$model(`Account`).updateMany({ internSchema: this.internSchema, intern: this.intern, default: true }, { default: false })
//     }
// })


export default mongoose.model("Account", accountSchema)