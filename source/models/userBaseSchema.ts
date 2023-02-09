import mongoose, { Model } from "mongoose"
import bcrypt from "bcryptjs"
import { IUserBase, IUserBaseMethods } from "models"


const userBaseSchema = new mongoose.Schema<IUserBase>({
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
    active: { type: Boolean, default: true },
    department: { type: String, required: [true, "department is required"] }


}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })


userBaseSchema.pre('save', async function () {
    //Ensure email is small caps
    this.email = this.email.trim().toLowerCase()

    //hash password
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

})


userBaseSchema.methods.comparePassword = async function (candidatePassword: string) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}
export { userBaseSchema }