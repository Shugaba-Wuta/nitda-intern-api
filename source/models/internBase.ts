import mongoose from "mongoose"
import { userBaseSchema, } from "./userBaseSchema"
import { GENDERS, QUALIFICATION, INTERNSHIP_STATUS } from "../config/data"
import { IInternBase } from "models"


const internBaseSchema = new mongoose.Schema<IInternBase>({
    highestQualification: { type: String, required: [true, "highestQualification is required"], enum: { values: QUALIFICATION, message: `highestQualification must be any of: ${QUALIFICATION}` } },
    gender: { type: String, required: [true, "gender is required"], enum: { values: GENDERS, message: `gender must be any of: ${GENDERS}` } },
    phoneNumber: { type: String, required: [true, "phoneNumber is required"] },
    assignedOffice: String,
    status: { type: String, enum: { values: INTERNSHIP_STATUS, message: `status must be any of: ${INTERNSHIP_STATUS}` } },
    expectedEndDate: { type: Date, required: [true, "expectedEndDate is required"] },
    startDate: { type: Date, default: Date.now },
    onPayroll: { type: Boolean, default: false },
    schoolOfStudy: { type: String, required: [true, "schoolOfStudy is required"] },
    courseOfStudy: { type: String, required: [true, "courseOfStudy is required"] },
})



internBaseSchema.virtual("duration").get(function () {

    let startDate = (this.startDate instanceof String) ? new Date(this.startDate).getTime() : this.startDate.getTime()
    let expectedEndDate = (this.expectedEndDate instanceof String) ? new Date(this.expectedEndDate).getTime() : this.expectedEndDate.getTime()
    const diffInMilliSeconds: number = startDate - expectedEndDate
    return diffInMilliSeconds
})

internBaseSchema.virtual("account", {
    ref: "Account",
    foreignField: "intern",
    localField: "_id"
})

internBaseSchema.virtual("nextOfKin", {
    ref: "NextOfKin",
    foreignField: "intern",
    localField: "_id"
})

export default internBaseSchema.add(userBaseSchema)