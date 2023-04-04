import { Schema, model, Model } from "mongoose"
import { userBaseSchema } from "./userBaseSchema"
import { IStaff, } from "models"


type UserModel = Model<IStaff, {}>

const staffSchema = new Schema<IStaff, UserModel>({
    jobTitle: { type: String, required: [true, "jobTitle is required"] }
})



export default model("Staff", staffSchema.add(userBaseSchema))





