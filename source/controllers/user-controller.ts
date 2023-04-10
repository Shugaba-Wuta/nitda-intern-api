import { IRequest } from "request";
import { Response } from "express"
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";
import { Staff, Nysc, Siwes, Intern, Account, NextOfKin, Session, Documents } from "../models";
import { IStaff, INysc, ISiwes, IIntern, INextOfKin, IAccount } from "../types/models"
import { MAX_RESULT_LIMIT, USER_SORT_OPTION, IMMUTABLE_USER_FIELD, USER_ROLE_LEVEL3, ADMIN_ROLE, HR_ROLE, DEPARTMENT_ROLE, ADMIN_ONLY_MUTABLE_FIELDS, DEPARTMENT_ONLY_MUTABLE_FIELDS, USER_NYSC, USER_SIWES, USER_INTERN, USER_STAFF } from "../config/data"
import { StatusCodes } from "http-status-codes";
import mongoose, { Schema } from "mongoose"
import Mailer from "../mailing/mailer";
import { formatTemplate, generateSlug, saveFileToServer } from "../utils/generic-utils";
import stream from "stream"
import { UploadedFile } from "express-fileupload";
import fs from "fs"


export const createAUser = async (req: IRequest, res: Response) => {
    /**
     * Creates a user of any Schema: Nysc, Staff, Intern, Siwes
     */
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
    /*
     * Fetches a user of any Schema: Nysc, Staff, Intern, Siwes
    */
    const { userID } = req.params
    const { schema } = req.query
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) {
        throw new BadRequestError("schema is missing")
    }
    if (![USER_NYSC, USER_SIWES, USER_INTERN, USER_STAFF].includes(String(schema))) {
        throw new BadRequestError("Invalid option in schema")
    }

    const user = await mongoose.model(String(schema)).findOne({ _id: userID }).populate(["account", "nextOfKin"])

    res.status(StatusCodes.OK).json({ message: "Fetched user", result: user, success: true })
}

export const deactivateUser = async (req: IRequest, res: Response) => {
    /**
     * Deactivates  a user of any Schema: Nysc, Staff, Intern, Siwes
     */

    //Accessible to roles: Admin & HR
    const { schema } = req.body
    const { userID } = req.params

    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) {
        throw new BadRequestError("schema is missing")
    }
    if (![USER_NYSC, USER_SIWES, USER_INTERN, USER_STAFF].includes(String(schema))) {
        throw new BadRequestError("Invalid option in schema")
    }
    const user = await mongoose.model(`${schema}`).findOne({ _id: userID, active: true, deleted: false })
    if (!user) {
        throw new NotFoundError(`${schema}: not found`)
    }
    user.deleted = true
    user.active = false
    user.deletedOn = Date.now()
    user.onPayroll = false
    await user.save()

    return res.status(StatusCodes.OK).json({ message: `${schema} deleted`, result: true, success: true })
}
export const reactivateUser = async (req: IRequest, res: Response) => {
    /**
     * Reactivates previously deactivated/ banned accounts. Artifacts are left untempered.
     */
    const { schema } = req.body
    const { userID } = req.params
    if (!userID) { throw new BadRequestError("userID is missing") }
    if (!schema) { throw new BadRequestError("schema is missing") }
    if (![USER_NYSC, USER_SIWES, USER_INTERN, USER_STAFF].includes(String(schema))) {
        throw new BadRequestError("Invalid option in schema")
    }
    const user = await mongoose.model(String(schema)).findOne({ deleted: true, active: false, _id: userID })
    if (!user) { throw new NotFoundError(`${schema} does not exist`) }
    user.deleted = false
    user.active = false
    user.deletedOn = null
    await user.save()
    return res.status(StatusCodes.OK).json({ message: `${schema} has been revived`, result: user, success: true })
}
export const permanentlyDeleteUser = async (req: IRequest, res: Response) => {
    /**
     * Permanently deletes a user with corresponding artifacts generated
     */
    const { schema } = req.body
    const { userID } = req.params
    if (!req.user?.permissions.includes(ADMIN_ROLE.toLocaleUpperCase())) {
        throw new UnauthorizedError("Permission denied")
    }
    if (!userID) { throw new BadRequestError("userID is missing") }
    if (!schema) { throw new BadRequestError("schema is missing") }
    if (![USER_NYSC, USER_SIWES, USER_INTERN, USER_STAFF].includes(String(schema))) {
        throw new BadRequestError("Invalid option in schema")
    }
    const user = await mongoose.model(String(schema)).findOneAndDelete({ deleted: true, active: false, _id: userID })
    if (!user) { throw new NotFoundError(`${schema} does not exist`) }
    if (schema != USER_STAFF) {
        await Account.deleteMany({ intern: userID, internSchema: schema })
        await NextOfKin.deleteMany({ intern: userID, internSchema: schema })
        await Session.deleteMany({ user: userID, userSchema: schema })
        await Documents.deleteMany({ user: userID, userSchema: schema })
    }
    res.status(StatusCodes.OK).json({ message: "Delete successful", user: null, success: true })
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
        throw new NotFoundError("User not found" + schema + userID)
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
    if (schema !== USER_STAFF) {
        await user.populate(["account", "nextOfKin"])
    }

    return res.status(StatusCodes.OK).json({ message: `${schema} updated`, result: user, success: true })
}
export const downloadAcceptanceOrClearance = async (req: IRequest, res: Response) => {
    /*
    * Creates "ACCEPTANCE" or "FINAL"
    */
    const { userID, docType, schema } = req.body
    const [ACCEPTANCE, FINAL] = ["ACCEPTANCE", "FINAL"]
    const DOCTYPES = [ACCEPTANCE, FINAL]
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!docType) {
        throw new BadRequestError("docType is missing")
    }
    if (!DOCTYPES.includes(String(docType))) {
        throw new BadRequestError("invalid value for docType")
    }
    if (!schema) { throw new BadRequestError("schema is missing") }
    if (![USER_NYSC, USER_SIWES, USER_INTERN].includes(String(schema))) {
        throw new BadRequestError("Invalid option in schema")
    }
    const user = await mongoose.model(String(schema)).findOne({ _id: userID })
    if (!user) {
        throw new NotFoundError(`${schema} does not exist`)
    }
    //Generate Template for NYSC
    if (user.role == USER_NYSC) {
        const { callUpNumber, fullName, gender, courseOfStudy, stateCode } = user
        const data = { callUpNumber, fullName, gender, courseOfStudy, stateCode }
        const template = docType === ACCEPTANCE ? "acceptance-letter.docx" : "final-clearance-nysc.docx"
        const parsedFileBuffer = await formatTemplate(template, data)
        var readStream = new stream.PassThrough();
        readStream.end(parsedFileBuffer);
        const formattedStateCode = generateSlug(docType + "-" + stateCode)

        res.set('Content-disposition', `attachment; filename=${formattedStateCode}.docx`);
        res.set('Content-Type', 'text/plain');
        readStream.pipe(res);
    }
}

export const uploadDocs = async (req: IRequest, res: Response) => {
    /**
    *Uploads and stores multiple/single documents on the server.

    * Due to issues in express-fileupload, the file extensions must not be more than 3 letters.

    */
    const { userID, schema } = req.body
    const docs = req.files?.docs as UploadedFile | UploadedFile[]
    if (!docs) {
        throw new BadRequestError("docs are missing")
    }
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!schema) { throw new BadRequestError("schema is missing") }
    if (![USER_NYSC, USER_SIWES, USER_INTERN, USER_STAFF].includes(String(schema))) {
        throw new BadRequestError("Invalid option in schema")
    }
    const docsArray = docs instanceof Array ? docs : [docs]
    const uploadedDocs = await saveFileToServer(["static", "public"], docsArray, userID, schema)
    res.status(StatusCodes.OK).json({ message: "Upload complete", result: uploadedDocs, success: true })
}

export const downloadDocs = async (req: IRequest, res: Response) => {
    /*
    *Downloads a document given the required params.
    */
    const { userID, schema: userSchema } = req.body
    const { docID } = req.params
    if (!userID) {
        throw new BadRequestError("userID is missing")
    }
    if (!docID) {
        throw new BadRequestError("docID is missing")
    }
    if (!userSchema) {
        throw new BadRequestError("userSchema is missing")
    }

    const docs = await Documents.findOne({ user: userID, userSchema, _id: docID })
    if (!docs) {
        throw new NotFoundError("Document not found")
    }
    const fileExists = fs.existsSync(docs.link)
    if (!fileExists) {
        throw new NotFoundError("DOcument not found")
    }
    res.status(StatusCodes.OK).download(docs.link)
}