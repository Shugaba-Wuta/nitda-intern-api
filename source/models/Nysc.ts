import mongoose from "mongoose"
import { WEEKDAYS } from "../config/data"
import internBase from "./internBase"

const nyscSchema = new mongoose.Schema({
    cdsDay: { type: String, enum: { values: WEEKDAYS, message: `cdsDay must be any of: ${WEEKDAYS}` } },
    classOfDegree: { type: String, required: [true, "classOfDegree is required"] },
    callUpNumber: { type: String, required: [true, "callUpNumber is required"] },
    stateCode: { type: String, required: [true, "stateCode is required"] },
    LGIContact: String,
    zonalInspectorContact: String

})

export default mongoose.model("Nysc", nyscSchema.add(internBase))