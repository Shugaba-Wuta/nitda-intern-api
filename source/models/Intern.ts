import { IIntern, IUserBaseMethods } from "models"
import { model, Model, Schema } from "mongoose"
import internBase from "./internBase"

type UserModel = Model<IIntern, {}, IUserBaseMethods>


const userSchema = new Schema<IIntern, UserModel, IUserBaseMethods>({
})
export default model("Intern", userSchema.add(internBase))