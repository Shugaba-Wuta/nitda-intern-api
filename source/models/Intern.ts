import { IIntern } from "models"
import { model, Model, Schema } from "mongoose"
import internBase from "./internBase"

type UserModel = Model<IIntern, {}>


const userSchema = new Schema<IIntern, UserModel>({
})
export default model("Intern", userSchema.add(internBase))