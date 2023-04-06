import mongoose, { Model } from "mongoose"
import bcrypt from "bcryptjs"
import { IUserBase, startPassResetFlowOptions } from "models"
import { IIntern, INysc, IStaff, ISiwes } from "models"
import { ADMIN_ROLE, DEPARTMENT_ROLE, HR_ROLE, UserTypes } from "../config/data"
import { OTP } from "../models"
import Mailer from "../mailing/mailer"
import { IRequest } from "request"



const userBaseSchema = new mongoose.Schema<IUserBase, Model<IUserBase>>({
    firstName: { type: String, required: [true, 'firstName is required'] },
    middleName: { type: String },
    lastName: { type: String, required: [true, 'lastName is required'] },
    role: { type: String, required: [true, "role is required"] },
    permissions: { type: [String], required: [true, "permissions are required"], },
    password: { type: String },
    changedPassword: { type: Boolean, default: false },
    email: { type: String, required: [true, "email is required"], index: { unique: true } },
    deleted: { type: Boolean, default: false },
    nitdaID: { type: String, required: [true, "nitdaID is required"] },
    deletedOn: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    department: { type: String, required: [true, "department is required"] },
    location: { type: String, required: [true, "location is required"] }


}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })


userBaseSchema.pre('save', async function () {
    //Ensure email is small caps
    this.email = this.email.trim().toLowerCase()

    //hash password
    if (this.password && this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

})
userBaseSchema.pre("save", async function () {
    if (this.isModified("deleted") && !this.deletedOn) {
        this.deletedOn = new Date()
    }

})


userBaseSchema.methods.comparePassword = async function (candidatePassword: string) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}
userBaseSchema.methods.startPassResetFlow = async function (options: startPassResetFlowOptions) {
    const schema: string = [ADMIN_ROLE, HR_ROLE, DEPARTMENT_ROLE].includes(this.role) ? "Staff" : this.role
    const otp = await OTP.createAToken(String(this._id), schema, "PASSWORD-CHANGE", this.email)

    await Mailer.sendEmail(this.email, "Admin", { email: this.email, firstName: this.firstName, OTPCode: otp, sessionID: options.sessionID, IPAddress: options.IPAddress, userAgent: options.userAgent }, "password-reset", "Password reset otp",)

    return otp

}

userBaseSchema.methods.createUser = async function (userInfo: IIntern | INysc | ISiwes | IStaff, schema: UserTypes) {
    await this.model(schema).create()
}
export { userBaseSchema }