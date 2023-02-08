import mongoose from "mongoose"
import { userBaseSchema } from "./userBaseSchema"

const staffSchema = new mongoose.Schema({
    jobTitle: { type: String, required: [true, "jobTitle is required"] },
    department: { type: String, required: [true, "department is required"] }
})
export default mongoose.model("Staff", staffSchema.add(userBaseSchema))