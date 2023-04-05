import { IOTP } from "models";
import { Schema, model, Types, Model } from "mongoose";
import { MAX_OTP_TIME_IN_SECONDS, TIME_TOLERANCE_FOR_OTP } from "../config/data";

interface OTPModel extends Model<IOTP> {
    createAToken(user: string, schema: string, purpose: string, email?: string): Promise<string>,
    verifyToken(OTPCode: string, purpose: string, email: string,): Promise<boolean>
}
const otpSchema = new Schema<IOTP, OTPModel>({
    OTPCode: { type: String, trim: true, required: [true, "Token.OTPCode is missing"] },
    user: { type: Types.ObjectId, refPath: "schema" },
    purpose: { type: String, required: [true, "Token.purpose is missing"] },
    email: {
        type: String,
        trim: true
    },
    used: {
        type: Boolean,
        default: false
    },
    schema: { type: String, required: [true, "OTP.schema is missing"] }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,

})

otpSchema.statics.createAToken = async function (user, schema, purpose, email) {
    const totp = (function () {
        return Math.random().toString(10).substring(3, 9)
    })()
    await this.findOneAndDelete({ user, purpose })

    const token = await this.create({ user, schema, email, purpose, OTPCode: totp })
    return token.OTPCode
}
otpSchema.statics.verifyToken = async function (otpCode, purpose, email) {
    const token = await this.findOne({ OTPCode: otpCode, purpose, email, used: false })
    if (!token) {
        return false
    }
    token.used = true
    await token.save()
    return true
}

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: Math.ceil(MAX_OTP_TIME_IN_SECONDS * TIME_TOLERANCE_FOR_OTP) })
otpSchema.index({ email: 1, used: 1, purpose: 1 }, { unique: true })


export default model<IOTP, OTPModel>("OTP", otpSchema)