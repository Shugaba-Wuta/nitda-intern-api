import { INysc, IUserBaseMethods } from "models"
import { Model, model, Schema } from "mongoose"
import { WEEKDAYS } from "../config/data"
import internBase from "./internBase"

type UserModel = Model<INysc, {}, IUserBaseMethods>


const nyscSchema = new Schema<INysc, UserModel, IUserBaseMethods>({
    cdsDay: { type: String, enum: { values: WEEKDAYS, message: `cdsDay must be any of: ${WEEKDAYS}` } },
    classOfDegree: { type: String, required: [true, "classOfDegree is required"] },
    callUpNumber: { type: String, required: [true, "callUpNumber is required"] },
    stateCode: { type: String, required: [true, "stateCode is required"] },
    LGIContact: String,
    zonalInspectorContact: String

})

export default model("Nysc", nyscSchema.add(internBase))