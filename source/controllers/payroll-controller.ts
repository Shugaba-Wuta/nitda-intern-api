import { Response } from "express"
import { IRequest } from "../types/request"
import { IIntern, INysc, ISiwes } from "models"
import { Intern, Nysc, Siwes } from "../models"
import { StatusCodes } from "http-status-codes"
import { getAllInternsOnPayroll } from "../utils/model-utils"




export const getAllPaymentInfo = async (req: IRequest, res: Response) => {
    /**
     * Get all interns on payroll
    */
    const allUserOnPayroll = await getAllInternsOnPayroll({ populateFields: ["account"] })
    console.log(allUserOnPayroll.length)

    return res.status(StatusCodes.OK).json({ message: "list of interns on payroll", success: true, result: allUserOnPayroll })
}
export const addInternsToPayRoll = async (req: IRequest, res: Response) => {
    /**
     * Add (n) interns to payRoll
    */
    const { numberToAdd = 1 } = req.body
    //Get (n) NYSC, SIWES and INTERN sorted by createdAt.
    const nysc = await Nysc.find({ active: true, deleted: false, onPayroll: false }).sort({ createdAt: 1 }).limit(numberToAdd)
    const siwes = await Siwes.find({ active: true, deleted: false, onPayroll: false }).sort({ createdAt: 1 }).limit(numberToAdd)
    const intern = await Intern.find({ active: true, deleted: false, onPayroll: false }).sort({ createdAt: 1 }).limit(numberToAdd)
    const sortedQualifiedInterns = [...nysc, ...siwes, ...intern].sort((a, b) => {
        let aDate = new Date(String(a.createdAt))
        let bDate = new Date(String(b.createdAt))
        return aDate.getTime() - bDate.getTime()
    })
    var selectedInterns = sortedQualifiedInterns.length > numberToAdd ? sortedQualifiedInterns.slice(0, numberToAdd) : sortedQualifiedInterns
    //Modify the first n-records
    for await (const intern of selectedInterns) {
        intern.onPayroll = true
        await intern.save()
    }
    res.status(StatusCodes.OK).json({ message: "Added interns to payroll", result: selectedInterns, success: true })
}