import { Nysc, Siwes, Staff, Intern } from "../models"
import { INysc, ISiwes, IStaff, IIntern } from "models"
import { Types, Model, Document } from "mongoose"


export const getAnyUser = async (deleted: boolean = false, active: boolean = true, email: string, userID: string | Types.ObjectId) => {
    interface IQueryParams {
        email?: string,
        deleted?: boolean,
        active?: boolean,
        _id?: string | Types.ObjectId
    }
    const queryParams: IQueryParams = { deleted, active }
    if (email) {
        queryParams.email = email
    }
    if (userID) {
        queryParams._id = userID
    }

    let nysc, siwes, staff, intern
    nysc = await Nysc.findOne(queryParams)
    siwes = await Siwes.findOne(queryParams)
    staff = await Staff.findOne(queryParams)
    intern = await Intern.findOne(queryParams)

    const user: INysc | ISiwes | IStaff | IIntern | null = staff || nysc || siwes || intern
    return user
}

export const getAllInternsOnPayroll = async (options?: { populateFields: string[] }) => {
    /***
     * Queries for interns on the payroll
     */
    const nyscOnPayroll = await Nysc.find({ deleted: false, active: true, onPayroll: true })
    const siwesOnPayroll = await Siwes.find({ deleted: false, active: true, onPayroll: true })
    const internsOnPayroll = await Intern.find({ deleted: false, active: true, onPayroll: true })

    const allUser = [...nyscOnPayroll, ...siwesOnPayroll, ...internsOnPayroll]

    if (options?.populateFields) {
        for await (const intern of allUser) {
            if (intern && options.populateFields) { await intern.populate(options.populateFields) }
        }
    }
    return allUser
}