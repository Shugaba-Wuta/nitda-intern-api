import { INextOfKin } from "models";
import mongoose from "mongoose";
import { INTERN_SCHEMA } from "../config/data";



const nextOfKinSchema = new mongoose.Schema<INextOfKin>({
    intern: { type: mongoose.Types.ObjectId, refPath: "internSchema" },
    internSchema: { type: String, required: [true, "internSchema is required"], enum: { values: INTERN_SCHEMA, message: `internSchema must be any of: ${INTERN_SCHEMA}` } },
    phoneNumber: { type: String, required: [true, "nexOfKin phoneNumber is required"] },
    name: { type: String, required: [true, "nextOfKin name is required"] },
    email: String
})




export default mongoose.model("NextOfKin", nextOfKinSchema)