import mongoose, { Model } from "mongoose"
import bcrypt from "bcryptjs"
import { IUserBase } from "models"
import { IIntern, INysc, IStaff, ISiwes } from "models"
import { UserTypes } from "../config/data"


const userBaseSchema = new mongoose.Schema<IUserBase>({
    firstName: { type: String, required: [true, 'firstName is required'] },
    middleName: { type: String },
    lastName: { type: String, required: [true, 'lastName is required'] },
    role: { type: String, required: [true, "role is required"] },
    permissions: { type: [String], required: [true, "permissions are required"] },
    password: { type: String },
    email: { type: String, required: [true, "email is required"], index: { unique: true } },
    deleted: { type: Boolean, default: false },
    nitdaID: { type: String, required: [true, "nitdaID is required"] },
    deletedOn: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    department: { type: String, required: [true, "department is required"] }


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

userBaseSchema.methods.createUser = async function (userInfo: IIntern | INysc | ISiwes | IStaff, schema: UserTypes) {
    await this.model(schema).create()
}
export { userBaseSchema }