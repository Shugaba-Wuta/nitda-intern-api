import mongoose from "mongoose"
import internBase from "./internBase"

const internSchema = new mongoose.Schema({
})
export default mongoose.model("Intern", internSchema.add(internBase))