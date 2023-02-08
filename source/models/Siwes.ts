import mongoose from "mongoose"
import internBase from "./internBase"

const siwesSchema = new mongoose.Schema({
    schoolID: { type: String, required: [true, "schoolID is missing"] },
    schoolSupervisorContact: { type: String, required: [true, "schoolSupervisorContact is missing"] }
})


export default mongoose.model("Siwes", siwesSchema.add(internBase))