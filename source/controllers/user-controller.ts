import { IRequest } from "request";
import { Response } from "express"
import { BadRequestError, NotFoundError } from "../errors";
import { Staff, Nysc, Siwes, Intern, Account, NextOfKin } from "../models";
import { IStaff, INysc, ISiwes, IIntern, INextOfKin, IAccount } from "../types/models"
import { USER_ROLE_LEVEL1, MAX_RESULT_LIMIT, USER_SORT_OPTION, IMMUTABLE_USER_FIELD } from "../config/data"
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose"



export const createAUser = async (req: IRequest, res: Response) => {
    /*Creates a user of any Schema: Nysc, Staff, Intern, Siwes*/
    const { userSchema, userData, account, nextOfKin } = req.body


    if (!userSchema) {
        throw new BadRequestError("Create user: userSchema is missing")
    }
    if (!userData) {
        throw new BadRequestError("Create user: userData is missing")
    }
    var newUser: IStaff | INysc | ISiwes | IIntern
    var newAccount: IAccount
    var newNOK: INextOfKin
    if (userSchema === "Staff") {
        //Get the appropriate permission
        newUser = await new Staff({ ...userData }).save()

        return res.status(StatusCodes.CREATED)
            .json({ message: "Staff created", result: { newUser }, success: true })
    }
    else if (userSchema === "Nysc") {
        newUser = await new Nysc({ ...userData, }).save()


    } else if (userSchema === "Siwes") {
        newUser = await new Siwes({ ...userData, }).save()

    } else if (userSchema === "Intern") {
        newUser = await new Intern({ ...userData, }).save()

    } else {
        throw new BadRequestError(`userSchema: invalid value ${userSchema}`)
    }
    newAccount = await new Account({ intern: newUser._id, internSchema: userSchema, ...account }).save()
    newNOK = await new NextOfKin({ intern: newUser._id, internSchema: userSchema, ...nextOfKin }).save()

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
    if (req.user && !USER_ROLE_LEVEL1.includes(req.user.role)) {
        active = true
        staff = false
        deleted = false
        schemas = "Nysc,Siwes,Intern"
    }
    //set the limit
    limit = String((Number(limit) <= MAX_RESULT_LIMIT) ? limit : MAX_RESULT_LIMIT)

    //set the skip
    const skipResult = Number(pageNumber) > 0 ? (Number(pageNumber) - 1) * Number(limit) : Number(limit)
    const result = []
    for await (const schema of String(schemas).replace(/\s/, "").split(",")) {
        //Loop over selected `schema s` and add destructured query to result for sorting.
        let preQuery = await mongoose.model(`${schema}`).aggregate([{ $match: { $text: { $search: String(query) } } }, {
            $project: {
                _id: 0, score: {
                    $meta: "textScore"
                }
            }
        }, { $match: { active, deleted } }])
            .skip(skipResult)
            .limit(Number(limit))
        result.push(...preQuery)
    }
    if (staff) {
        //if elevated role and includeStaff:staff =true, add staff to result
        let staffQuery = await Staff.aggregate([{ $match: { $text: { $search: String(query) } } }, {
            $project: {
                _id: 0, score: {
                    $meta: "textScore"
                }
            }
        }, { $match: { active } }])
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

    const user = await mongoose.model(String(schema)).findOne({ _id: userID }).populate("account").populate("nextOfKin")

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
    const { schema } = req.body
    const { userID } = req.params
    const { userData, account, nextOfKin } = req.body
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) {
        throw new BadRequestError("schema is missing")
    }

    const user = await mongoose.model(`${schema}`).findOne({ _id: userID })

    if (account) {
        await mongoose.model("Account").findOneAndUpdate({ intern: user._id, internSchema: schema }, { ...account })
    }
    if (nextOfKin) {
        await mongoose.model("NextOfKin").findOneAndUpdate({ intern: user._id, internSchema: schema }, { ...nextOfKin })
    }

    for (const field of IMMUTABLE_USER_FIELD) {
        delete userData[field]
    }
    Object.keys(userData).forEach((key => {
        user[key] = userData[key]
    }))
    await user.save().populate("account", "nextOfKin")

    return res.status(StatusCodes.OK).json({ message: `${schema} updated`, result: user, success: true })
}