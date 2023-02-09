import { Schema, model, Model } from "mongoose"
import { userBaseSchema } from "./userBaseSchema"
import { IStaff, IUserBaseMethods, } from "models"


type UserModel = Model<IStaff, {}, IUserBaseMethods>

const staffSchema = new Schema<IStaff, UserModel, IUserBaseMethods>({
    jobTitle: { type: String, required: [true, "jobTitle is required"] },


})



export default model("Staff", staffSchema.add(userBaseSchema))





