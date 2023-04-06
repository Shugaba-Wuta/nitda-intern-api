import { IRequest } from "request";
import { Response } from "express"
import { BadRequestError, NotFoundError } from "../errors";
import { Staff, Nysc, Siwes, Intern, Account, NextOfKin } from "../models";
import { IStaff, INysc, ISiwes, IIntern, INextOfKin, IAccount } from "../types/models"
import { USER_ROLE_LEVEL1, MAX_RESULT_LIMIT, USER_SORT_OPTION, IMMUTABLE_USER_FIELD, USER_ROLE_LEVEL3, ADMIN_ROLE, HR_ROLE, DEPARTMENT_ROLE, ADMIN_ONLY_MUTABLE_FIELDS, DEPARTMENT_ONLY_MUTABLE_FIELDS, USER_ROLE_LEVEL0, USER_NYSC, USER_SIWES, USER_INTERN } from "../config/data"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose"
import Mailer from "../mailing/mailer";


export const createAUser = async (req: IRequest, res: Response) => {
    /*Creates a user of any Schema: Nysc, Staff, Intern, Siwes*/
    const { userData } = req.body
    const { role: userSchema } = req.body.userData


    if (!userSchema) {
        throw new BadRequestError("Create user: userData.role is missing")
    }
    if (!userData) {
        throw new BadRequestError("Create user: userData is missing")
    }
    if (!userData.role || !USER_ROLE_LEVEL3.includes(userData.role)) {
        throw new BadRequestError("invalid value for role")

    }
    var newUser: IStaff | INysc | ISiwes | IIntern
    var newAccount: IAccount
    var newNOK: INextOfKin
    if ([ADMIN_ROLE, HR_ROLE, DEPARTMENT_ROLE].includes(userSchema)) {
        //Get the appropriate permission
        const permissions = (userData.role === ADMIN_ROLE) ? "admin" : userData.permissions
        newUser = await new Staff({ ...userData, permissions }).save()
        //Mail Staff
        await Mailer.sendEmail(userData.email, "Admin", { email: userData.email, firstName: userData.firstName, role: String(userData.role).toUpperCase(), password: userData.password }, "new-account-creation", "Welcome to Intern Portal",)

        return res.status(StatusCodes.CREATED)
            .json({ message: "Staff created", result: { newUser }, success: true })
    }
    else if (userSchema === "Nysc") {
        newUser = new Nysc({ ...userData, })


    } else if (userSchema === "Siwes") {
        newUser = new Siwes({ ...userData, })

    } else if (userSchema === "Intern") {
        newUser = new Intern({ ...userData, })

    } else {
        throw new BadRequestError(`userSchema: invalid value ${userSchema}`)
    }
    const nextOfKin: INextOfKin | undefined = userData.nextOfKin
    const account: IAccount | undefined = userData.account
    if (!account || !nextOfKin) {

        let message: string[] = []
        if (!account) {
            message.push(`account is missing`)
        }
        if (!nextOfKin) {
            message.push(`nextOfKin is missing`)
        }
        throw new BadRequestError(message.join(", "))
    }

    //! Important: Save user only after account and nextOfKin have been successfully saved.
    try {

        newAccount = await new Account({ intern: String(newUser._id), internSchema: userSchema, ...account }).save()
        newNOK = await new NextOfKin({ intern: String(newUser._id), internSchema: userSchema, ...nextOfKin }).save()
        await newUser.save()

    } catch (err) {
        await Account.deleteMany({ intern: String(newUser._id) })
        await NextOfKin.deleteMany({ intern: String(newUser._id) })
        throw err
    }
    //Mail Intern
    await Mailer.sendEmail(userData.email, "Admin", { email: userData.email, firstName: userData.firstName, role: String(userData.role).toUpperCase(), password: userData.password }, "new-account-creation", "Welcome to Intern Portal",)


    return res.status(StatusCodes.CREATED).json({
        message: `${userSchema} created`, result: {
            newUser, nextOfKin: newNOK, account: newAccount
        }, success: true
    })
}

export const searchUser = async (req: IRequest, res: Response) => {
    /*Searches for a user of any Schema: Nysc, Staff, Intern, Siwes*/

    var { query, includeStaff: staff = false, schemas, deleted = false, active = true, sortBy = "relevance", pageNumber = 1, limit } = req.query
    //set default params for non-admin and non-HR  query params
    if (req.user && !req.user.permissions.includes(ADMIN_ROLE.toLowerCase())) {
        active = true
        staff = false
        deleted = false
        // schemas = "Nysc,Siwes,Intern"
    }
    //set the limit
    limit = String((Number(limit) <= MAX_RESULT_LIMIT) ? limit : MAX_RESULT_LIMIT)

    //set the skip
    const skipResult = Number(pageNumber) > 0 ? (Number(pageNumber) - 1) * Number(limit) : Number(limit)
    const result = []
    schemas = String(schemas).replace(/\s/, "").split(",")
    //Verify Schemas are the interns
    schemas.forEach(item => {
        if (![USER_NYSC, USER_SIWES, USER_INTERN].includes(item)) {
            throw new BadRequestError("Invalid option in schemas")
        }
    })

    for await (const schema of String(schemas).replace(/\s/, "").split(",")) {
        let preQuery = await mongoose.model(`${schema}`).aggregate([{ $match: { $text: { $search: String(query) } } }, {
            $addFields: {
                _id: 0, score: {
                    $meta: "textScore"
                }
            }
        },
        { $match: { active: Boolean(active), deleted: Boolean(deleted) } }
        ]
        )
            .skip(skipResult)
            .limit(Number(limit))
        result.push(...preQuery)
    }
    if (staff) {
        //if elevated role and includeStaff:staff =true, add staff to result
        let staffQuery = await Staff.aggregate([{ $match: { $text: { $search: String(query) } } }, {
            $addFields: {
                _id: 0, score: {
                    $meta: "textScore"
                }
            }
        }, { $match: { active: Boolean(active), deleted: Boolean(deleted) } }])
            .skip(skipResult)
            .limit(Number(limit))
        result.push(...staffQuery)
    }
    //sort the result based on: textScore, USER_SORT_OPTION
    if (String(sortBy) === "relevance") {
        result.sort((a, b) => b.score - a.score)
    }
    else if (Object.keys(USER_SORT_OPTION).includes(String(sortBy))) {
        result.sort((a, b) => {
            if (a[String(sortBy)] > b[String(sortBy)]) {
                return -1
            } else if (a[String(sortBy)] > b[String(sortBy)]) {
                return 1
            } else {
                return 0
            }
        })
    }

    return res.status(StatusCodes.OK).json({ message: "Fetched users", result: result, success: true })


}

export const getAUser = async (req: IRequest, res: Response) => {
    /*Fetches a user of any Schema: Nysc, Staff, Intern, Siwes*/
    const { userID } = req.params
    const { schema } = req.query
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) {
        throw new BadRequestError("schema is missing")
    }

    const user = await mongoose.model(String(schema)).findOne({ _id: userID }).populate(["account", "nextOfKin"])

    res.status(StatusCodes.OK).json({ message: "Fetched user", result: user, success: true })
}

export const deleteAUser = async (req: IRequest, res: Response) => {
    /*Deactivates  a user of any Schema: Nysc, Staff, Intern, Siwes*/

    //Accessible to roles: Admin & HR
    const { schema, deleteUser, deactivate } = req.body
    const { userID } = req.params

    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) {
        throw new BadRequestError("schema is missing")
    }

    const user = await mongoose.model(`${schema}`).findOne({ _id: userID })
    if (!user) {
        throw new NotFoundError(`${schema}: not found`)
    }
    user.deleted = deleteUser
    user.active = !deactivate
    await user.save()

    return res.status(StatusCodes.OK).json({ message: `${schema} deleted`, result: true, success: true })


}

export const updateAUser = async (req: IRequest, res: Response) => {
    /*Updates a user of any Schema: Nysc, Staff, Intern, Siwes*/
    //Accessible to roles: Admin & HR
    const { userID } = req.params
    const { userData } = req.body
    var { account, nextOfKin, role: schema } = userData
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) {
        throw new BadRequestError("schema is missing")
    }
    if ([ADMIN_ROLE, HR_ROLE, DEPARTMENT_ROLE].includes(schema)) {
        schema = "Staff"
    }

    const user = await mongoose.model(`${schema}`).findOne({ _id: userID })
    if (!user) {
        throw new NotFoundError("User not found")
    }
    //
    //AVOID UNPRIVILEGED UPDATES
    //
    //Remove unchangeable fields from userData
    for (const field of IMMUTABLE_USER_FIELD) {
        delete userData[field]
    }
    //Remove admin/HR only updatable fields
    if (!req.user?.permissions.includes("admin")) {
        ADMIN_ONLY_MUTABLE_FIELDS.forEach(field => {
            delete userData[field]
        })
    }
    //Remove department only updatable fields
    if (!req.user?.permissions.includes("user:write")) {
        DEPARTMENT_ONLY_MUTABLE_FIELDS.forEach(field => {
            delete userData[field]
        })
    }
    //
    //PERFORM NECESSARY UPDATES
    //
    if (account) {
        await mongoose.model("Account").findOneAndUpdate({ intern: user._id, internSchema: schema }, { ...account })
    }
    if (nextOfKin) {
        await mongoose.model("NextOfKin").findOneAndUpdate({ intern: user._id, internSchema: schema }, { ...nextOfKin })
    }
    Object.keys(userData).forEach((key => {
        user[key] = userData[key]
    }))
    await user.save()
    await user.populate(["account", "nextOfKin"])

    return res.status(StatusCodes.OK).json({ message: `${schema} updated`, result: user, success: true })
}